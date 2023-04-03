import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {
  ControlValueAccessor,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';

import {
  forkJoin,
  map,
  Observable,
  of,
  pairwise,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { ActionMetaService } from '../../../../../../../../service/action-meta.service';
import { FlowItemsDetailsState } from '../../../../../../../../store/model/flow-items-details-state.model';
import {
  ActionType,
  PieceActionSettings,
  UpdateActionRequest,
} from '@activepieces/shared';
import { DropdownItem } from '../../../../../../../../../common/model/dropdown-item.interface';
import {
  PieceConfig,
  PieceProperty,
  propsConvertor,
} from '../../../../../../../../../common/components/configs-form/connector-action-or-config';
import { PieceActionInputFormSchema } from '../../input-forms-schema';
import { BuilderSelectors } from '../../../../../../../../store/builder/builder.selector';
import { fadeInUp400ms } from '../../../../../../../../../../../../../ui/common/src/lib/animation/fade-in-up.animation';
import { FlowsActions } from '../../../../../../../../store/flow/flows.action';
import { isOverflown } from '../../../../../../../../../common/utils';
declare type ActionDropdownOptionValue = {
  actionName: string;
  configs: PieceConfig[];
  separator?: boolean;
};

declare type ActionDropdownOption = {
  label: {
    name: string;
    description: string;
  };
  value: ActionDropdownOptionValue;
  disabled?: boolean;
};
const ACTION_FORM_CONTROL_NAME = 'action';
const CONFIGS_FORM_CONTROL_NAME = 'configs';
declare type ConfigsFormControlValue = {
  input: Record<string, string | Array<any> | object>;
  customizedInputs: Record<string, boolean>;
};

declare type ComponentFormValue = {
  [ACTION_FORM_CONTROL_NAME]: string;
  [CONFIGS_FORM_CONTROL_NAME]: ConfigsFormControlValue;
};
@Component({
  selector: 'app-piece-action-input-form',
  templateUrl: './piece-action-input-form.component.html',
  styleUrls: ['./piece-action-input-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: PieceActionInputFormComponent,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: PieceActionInputFormComponent,
    },
  ],
  animations: [fadeInUp400ms],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieceActionInputFormComponent
  implements ControlValueAccessor, AfterViewInit
{
  readonly ACTION_FORM_CONTROL_NAME = ACTION_FORM_CONTROL_NAME;
  readonly CONFIGS_FORM_CONTROL_NAME = CONFIGS_FORM_CONTROL_NAME;
  updateStepName$: Observable<void>;
  pieceActionForm: UntypedFormGroup;
  initialSetup$: Observable<ActionDropdownOption[]>;
  triggerInitialSetup$: Subject<true> = new Subject();
  pieceName: string;
  pieceVersion: string;
  intialComponentInputFormValue: PieceActionInputFormSchema | null;
  selectedAction$: Observable<ActionDropdownOption | undefined>;
  actions$: Observable<ActionDropdownOption[]>;
  valueChanges$: Observable<void>;
  actionDropdownValueChanged$: Observable<{
    actionName: string;
    configs: PieceConfig[];
  }>;
  allAuthConfigs$: Observable<DropdownItem[]>;
  flowItemDetails$: Observable<FlowItemsDetailsState>;
  isOverflown = isOverflown;
  onChange: (val) => void = (value) => {
    value;
  };
  onTouch: () => void = () => {
    //ignore
  };
  constructor(
    private fb: UntypedFormBuilder,
    private actionMetaDataService: ActionMetaService,
    private cd: ChangeDetectorRef,
    private store: Store
  ) {
    this.flowItemDetails$ = this.store.select(
      BuilderSelectors.selectAllFlowItemsDetails
    );
    this.buildForm();
    this.actionDropdownValueChanged$ = this.pieceActionForm
      .get(ACTION_FORM_CONTROL_NAME)!
      .valueChanges.pipe(
        tap((val) => {
          this.actionSelectValueChanged(val);
        })
      );
  }
  ngAfterViewInit(): void {
    this.triggerInitialSetup$.next(true);
  }

  private buildForm() {
    this.pieceActionForm = this.fb.group({
      [ACTION_FORM_CONTROL_NAME]: new UntypedFormControl(
        null,
        Validators.required
      ),
    });
    this.pieceActionForm.markAllAsTouched();

    this.valueChanges$ = this.pieceActionForm.valueChanges.pipe(
      startWith(null),
      pairwise(),
      tap(
        (
          oldAndCurrentValues: [ComponentFormValue | null, ComponentFormValue]
        ) => {
          this.onChange(this.getFormattedFormData(oldAndCurrentValues));
        }
      ),
      map(() => void 0)
    );
  }

  fetchActions(pieceName: string, pieceVersion: string) {
    const pieceMetadata$ = this.actionMetaDataService.getPieceMetadata(
      pieceName,
      pieceVersion
    );

    this.actions$ = pieceMetadata$.pipe(
      map((pieceMetadata) => {
        const actionsKeys = Object.keys(pieceMetadata.actions);
        return actionsKeys.map((actionName) => {
          const action = pieceMetadata.actions[actionName];
          const configs = Object.entries(action.props).map(
            ([propName, prop]) => {
              return propsConvertor.convertToFrontEndConfig(
                propName,
                prop as PieceProperty
              );
            }
          );
          return {
            value: {
              actionName: actionName,
              configs: configs,
            },
            label: {
              name: action.displayName,
              description: action.description,
            },
          };
        });
      }),
      tap(() => {
        this.triggerInitialSetup$.next(true);
      }),
      shareReplay(1)
    );
    this.initialSetup$ = this.triggerInitialSetup$.pipe(
      switchMap(() => {
        return this.actions$.pipe(
          tap((items) => {
            this.setInitialFormValue(items);
          })
        );
      })
    );
    this.triggerInitialSetup$.next(true);
  }
  private setInitialFormValue(items: ActionDropdownOption[]) {
    if (
      this.intialComponentInputFormValue &&
      this.intialComponentInputFormValue.actionName
    ) {
      this.pieceActionForm
        .get(ACTION_FORM_CONTROL_NAME)!
        .setValue(
          items.find(
            (i) =>
              i.value.actionName ===
              this.intialComponentInputFormValue?.actionName
          )?.value,
          {
            emitEvent: false,
          }
        );
      this.selectedAction$ = of(
        items.find(
          (it) =>
            it.value.actionName ===
            this.intialComponentInputFormValue!.actionName
        )
      ).pipe(
        tap((selectedAction) => {
          this.setInitialConfigsFormValue(selectedAction);
        })
      );
    }
  }

  private setInitialConfigsFormValue(
    selectedAction: ActionDropdownOption | undefined
  ) {
    if (selectedAction) {
      const configs = [...selectedAction.value.configs];
      const configsValues = this.intialComponentInputFormValue!.input;
      if (configsValues) {
        Object.keys(configsValues).forEach((key) => {
          const config = configs.find((c) => c.key === key);
          if (config) {
            config.value = configsValues[key];
          }
        });
      }
      this.pieceActionForm.addControl(
        CONFIGS_FORM_CONTROL_NAME,
        new UntypedFormControl({
          value: {
            configs: [...configs],
            customizedInputs:
              this.intialComponentInputFormValue!.inputUiInfo
                ?.customizedInputs || {},
            setDefaultValues: false,
          },
          disabled: this.pieceActionForm.disabled,
        }),
        {
          emitEvent: false,
        }
      );
    }
  }

  writeValue(obj: PieceActionInputFormSchema): void {
    this.intialComponentInputFormValue = obj;
    this.pieceName = obj.pieceName;
    this.pieceVersion = obj.pieceVersion;
    this.pieceActionForm
      .get(ACTION_FORM_CONTROL_NAME)
      ?.setValue(undefined, { emitEvent: false });
    this.pieceActionForm.removeControl(CONFIGS_FORM_CONTROL_NAME, {
      emitEvent: false,
    });

    if (obj.type === ActionType.PIECE) {
      this.fetchActions(obj.pieceName, obj.pieceVersion);
    }
  }

  registerOnChange(fn: (value) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  validate() {
    if (this.pieceActionForm.valid) return null;
    return { invalid: true };
  }

  actionSelectValueChanged(
    selectedActionValue: { actionName: string; configs: PieceConfig[] } | null
  ) {
    if (selectedActionValue) {
      this.actionSelected(selectedActionValue);
      this.selectedAction$ = this.findActionByActionName(
        selectedActionValue.actionName
      );
    }
  }

  private actionSelected(selectedActionValue: {
    actionName: string;
    configs: PieceConfig[];
  }) {
    const configsForm = this.pieceActionForm.get(CONFIGS_FORM_CONTROL_NAME);
    if (!configsForm) {
      this.pieceActionForm.addControl(
        CONFIGS_FORM_CONTROL_NAME,
        new UntypedFormControl({
          configs: [...selectedActionValue.configs],
          customizedInputs: {},
          setDefaultValues: true,
        })
      );
    } else {
      configsForm.setValue({
        configs: [...selectedActionValue.configs],
        customizedInputs: {},
        setDefaultValues: true,
      });
    }
    this.cd.detectChanges();
    this.pieceActionForm.updateValueAndValidity();
    this.updateStepName(selectedActionValue.actionName);
  }

  getFormattedFormData(
    oldAndCurrentValues: [ComponentFormValue | null, ComponentFormValue]
  ): PieceActionSettings {
    let customizedInputs: Record<string, boolean>;
    if (
      oldAndCurrentValues[0] &&
      oldAndCurrentValues[0][ACTION_FORM_CONTROL_NAME] !==
        oldAndCurrentValues[1][ACTION_FORM_CONTROL_NAME]
    ) {
      customizedInputs = {};
    } else {
      customizedInputs =
        oldAndCurrentValues[1][CONFIGS_FORM_CONTROL_NAME].customizedInputs;
    }
    const action: ActionDropdownOptionValue = this.pieceActionForm.get(
      ACTION_FORM_CONTROL_NAME
    )!.value;
    const configs: ConfigsFormControlValue =
      this.pieceActionForm.get(CONFIGS_FORM_CONTROL_NAME)?.value || {};
    const res = {
      actionName: action?.actionName,
      input: {
        ...configs.input,
      },
      pieceName: this.pieceName,
      pieceVersion: this.pieceVersion,
      inputUiInfo: { customizedInputs: customizedInputs },
    };

    return res;
  }
  actionDropdownCompareFn(item, selected) {
    return item.actionName === selected?.actionName;
  }
  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.pieceActionForm.disable();
    } else {
      this.pieceActionForm.enable();
    }
  }
  findActionByActionName(actionNameLookup: string) {
    return this.actions$.pipe(
      map((items) => {
        return items.find((it) => it.value.actionName === actionNameLookup);
      })
    );
  }
  updateStepName(actionName: string) {
    this.updateStepName$ = forkJoin({
      action: this.findActionByActionName(actionName),
      step: this.store.select(BuilderSelectors.selectCurrentStep).pipe(take(1)),
    }).pipe(
      tap((res) => {
        if (res.step && res.action) {
          const clone = {
            ...res.step,
            displayName: res.action.label.name,
          } as UpdateActionRequest;

          this.store.dispatch(
            FlowsActions.updateAction({
              operation: clone,
            })
          );
        }
      }),
      map(() => void 0)
    );
  }
}
