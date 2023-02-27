import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { fadeInUp400ms } from '../../../animation/fade-in-up.animation';
import { CloudOAuth2PopupParams } from '../../../model/oauth2-popup-params.interface';
import { Oauth2Service } from '../../../service/oauth2.service';

@Component({
  selector: 'app-o-auth2-cloud-connect-control',
  templateUrl: './o-auth2-cloud-connect-control.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: OAuth2CloudConnectControlComponent,
    },
  ],
  animations: [fadeInUp400ms],
})
export class OAuth2CloudConnectControlComponent
  implements ControlValueAccessor
{
  @Input() popupParams: CloudOAuth2PopupParams;
  popUpError = false;

  responseData: unknown = null;
  isDisabled = false;
  popupOpened$: Observable<unknown>;
  onChange: (val) => void = (newValue) => {
    newValue;
  };
  onTouched: () => void = () => {
    //ignored
  };
  constructor(private oauth2Service: Oauth2Service) {}

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(obj: unknown): void {
    this.responseData = obj;
  }
  registerOnChange(fn: (val) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  openPopup(): void {
    this.popupOpened$ = this.oauth2Service
      .openCloudAuthPopup(this.popupParams)
      .pipe(
        tap((value) => {
          this.popUpError = false;
          this.responseData = value;
          this.onChange(value);
        }),
        catchError((err) => {
          this.responseData = null;
          this.onChange(null);
          this.popUpError = true;
          return throwError(() => {
            return err;
          });
        })
      );
  }
  clearControlValue() {
    this.responseData = null;
    this.onChange(null);
  }
}
