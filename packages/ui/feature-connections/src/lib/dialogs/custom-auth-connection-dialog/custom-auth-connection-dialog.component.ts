import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { catchError, Observable, of, take, tap } from 'rxjs';
import {
  AppConnection,
  AppConnectionType,
  CustomAuthConnection,
  ErrorCode,
  UpsertCustomAuthRequest,
} from '@activepieces/shared';
import {
  CustomAuthProps,
  CustomAuthProperty,
  PropertyType,
} from '@activepieces/pieces-framework';
import deepEqual from 'deep-equal';
import { AppConnectionsService } from '../../services/app-connections.service';
import { ConnectionValidator } from '../../validators/connectionNameValidator';
import {
  BuilderSelectors,
  appConnectionsActions,
} from '@activepieces/ui/feature-builder-store';

export interface CustomAuthDialogData {
  pieceAuthProperty: CustomAuthProperty<boolean, CustomAuthProps>;
  pieceName: string;
  connectionToUpdate?: CustomAuthConnection;
}

@Component({
  selector: 'app-custom-auth-connection-dialog',
  templateUrl: './custom-auth-connection-dialog.component.html',
})
export class CustomAuthConnectionDialogComponent {
  loading = false;
  settingsForm: UntypedFormGroup;
  PropertyType = PropertyType;
  keyTooltip =
    'The ID of this authentication definition. You will need to select this key whenever you want to reuse this authentication.';
  upsert$: Observable<AppConnection | null>;
  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public dialogData: CustomAuthDialogData,
    private store: Store,
    private dialogRef: MatDialogRef<CustomAuthConnectionDialogComponent>,
    private appConnectionsService: AppConnectionsService
  ) {
    const props: Record<string, FormControl> = {};
    Object.entries(this.dialogData.pieceAuthProperty.props).forEach(
      ([propName, prop]) => {
        console.log(prop.required);
        if (prop.required) {
          props[propName] = new FormControl(
            prop.defaultValue ?? '',
            Validators.required
          );
        } else {
          props[propName] = new FormControl(prop.defaultValue ?? '');
        }
      }
    );

    this.settingsForm = this.fb.group({
      name: new FormControl(
        this.dialogData.connectionToUpdate?.name ||
          appConnectionsService.getConnectionNameSuggest(
            this.dialogData.pieceName
          ),
        {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.pattern('[A-Za-z0-9_\\-]*'),
          ],
          asyncValidators: [
            ConnectionValidator.createValidator(
              this.store
                .select(BuilderSelectors.selectAllAppConnections)
                .pipe(take(1)),
              undefined
            ),
          ],
        }
      ),
      ...props,
    });
    if (this.dialogData.connectionToUpdate) {
      this.settingsForm.patchValue(
        this.dialogData.connectionToUpdate.value.props
      );
      this.settingsForm.get('name')?.disable();
    }
  }
  dropdownCompareWithFunction = (opt: any, formControlValue: any) => {
    return formControlValue && deepEqual(opt, formControlValue);
  };
  submit() {
    this.settingsForm.markAllAsTouched();
    if (this.settingsForm.valid) {
      this.loading = true;
      const propsValues = this.settingsForm.getRawValue();
      delete propsValues.name;
      const upsertRequest: UpsertCustomAuthRequest = {
        appName: this.dialogData.pieceName,
        name: this.settingsForm.getRawValue().name,
        value: {
          type: AppConnectionType.CUSTOM_AUTH,
          props: propsValues,
        },
      };
      this.upsert$ = this.appConnectionsService.upsert(upsertRequest).pipe(
        catchError((response) => {
          console.error(response);

          this.settingsForm.setErrors({
            message:
              response.error.code === ErrorCode.INVALID_APP_CONNECTION
                ? `Connection failed: ${response.error.params.error}`
                : 'Internal Connection error, failed please check your console.',
          });
          return of(null);
        }),
        tap((connection) => {
          if (connection) {
            this.store.dispatch(
              appConnectionsActions.upsert({ connection: connection })
            );
            this.dialogRef.close(connection);
          }
          this.loading = false;
        })
      );
    }
  }
}
