import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { fadeInUp400ms } from 'src/app/modules/common/animation/fade-in-up.animation';
import { FrontEndConnectorConfig } from 'src/app/modules/common/components/configs-form/connector-action-or-config';
import { ConfigType } from 'src/app/modules/common/model/enum/config-type';
import { Config } from 'src/app/modules/common/model/fields/variable/config';
import { ConfigKeyValidator } from 'src/app/modules/flow-builder/page/flow-builder/validators/configKeyValidator';
import { CollectionActions } from 'src/app/modules/flow-builder/store/action/collection.action';
import { BuilderSelectors } from 'src/app/modules/flow-builder/store/selector/flow-builder.selector';
import { environment } from 'src/environments/environment';

interface AuthConfigSettings {
	redirect_url: FormControl<string>;
	client_secret: FormControl<string>;
	client_id: FormControl<string>;
	auth_url: FormControl<string>;
	token_url: FormControl<string>;
	scope: FormControl<string>;
	key: FormControl<string>;
	value: FormControl<any>;
	response_type: FormControl<string>;
	refresh_url: FormControl<string>;
}
@Component({
	selector: 'app-new-authentication-modal',
	templateUrl: './new-authentication-modal.component.html',
	styleUrls: ['./new-authentication-modal.component.scss'],
	animations: [fadeInUp400ms],
})
export class NewAuthenticationModalComponent implements OnInit {
	@Input() connectorAuthConfig: FrontEndConnectorConfig;
	@Input() appName: string;
	@Input() configToUpdateWithIndex: { config: Config; indexInList: number } | undefined;
	settingsForm: FormGroup<AuthConfigSettings>;
	collectionId$: Observable<string>;
	submitted = false;
	clientIdTooltip = 'Your App ID, Key or Client ID. You can find it if you go to your app on the 3rd party service.';
	clientSecretTooltip =
		"Your App Secret. It's usually hidden and will show up when you click on Show in your app on the 3rd party service";
	redirectUrlTooltip =
		'Copy this URL and paste it under Redirect URL in your app on the 3rd party service. Activepieces predefines this because we manage the authentication flow.';
	scopesTooltip = 'The permissions needed to access the endpoints you plan to work with on the 3rd party service.';
	keyTooltip =
		'The ID of this authentication definition. You will need to select this key whenever you want to reuse this authentication.';
	constructor(
		private fb: FormBuilder,
		private store: Store,
		public dialogRef: MatDialogRef<NewAuthenticationModalComponent>,
		@Inject(MAT_DIALOG_DATA)
		dialogData: {
			connectorAuthConfig: FrontEndConnectorConfig;
			appName: string;
			configToUpdateWithIndex: { config: Config; indexInList: number } | undefined;
		}
	) {
		this.appName = dialogData.appName;
		this.connectorAuthConfig = dialogData.connectorAuthConfig;
		this.configToUpdateWithIndex = dialogData.configToUpdateWithIndex;
	}

	ngOnInit(): void {
		this.collectionId$ = this.store.select(BuilderSelectors.selectCurrentCollectionId);
		console.log(environment.redirectUrl);
		this.settingsForm = this.fb.group({
			redirect_url: new FormControl(environment.redirectUrl, { nonNullable: true, validators: [Validators.required] }),
			client_secret: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
			client_id: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
			auth_url: new FormControl(this.connectorAuthConfig.authUrl || '', {
				nonNullable: true,
				validators: [Validators.required],
			}),
			token_url: new FormControl(this.connectorAuthConfig.tokenUrl || '', {
				nonNullable: true,
				validators: [Validators.required],
			}),
			response_type: new FormControl('code', { nonNullable: true, validators: [Validators.required] }),
			scope: new FormControl(this.connectorAuthConfig.scopes || '', {
				nonNullable: true,
				validators: [Validators.required],
			}),
			key: new FormControl(this.appName.replace(/[^A-Za-z0-9_]/g, '_'), {
				nonNullable: true,
				validators: [Validators.required, Validators.pattern('[A-Za-z0-9_]*')],
				asyncValidators: [
					ConfigKeyValidator.createValidator(
						this.store.select(BuilderSelectors.selectAllConfigs).pipe(take(1)),
						undefined
					),
				],
			}),
			value: new FormControl(undefined as any, Validators.required),
			refresh_url: new FormControl('code', { nonNullable: true, validators: [Validators.required] }),
		});

		if (this.configToUpdateWithIndex) {
			this.settingsForm.patchValue({
				...this.configToUpdateWithIndex.config.settings!,
				value: this.configToUpdateWithIndex.config.value,
			});
			this.settingsForm.controls.key.setValue(this.configToUpdateWithIndex.config.key);
			this.settingsForm.controls.key.disable();
		}
	}
	submit(currentCollectionId: string) {
		this.submitted = true;
		this.settingsForm.markAllAsTouched();
		if (this.settingsForm.valid) {
			const config = this.constructConfig(currentCollectionId);
			this.saveConfigToCollection(config);
			this.dialogRef.close(config);
		}
	}
	constructConfig(currentCollectionId: string) {
		const configKey = this.configToUpdateWithIndex
			? this.configToUpdateWithIndex.config.key
			: this.settingsForm.get('key')!.value;
		const settingsFormValue: any = { ...this.settingsForm.getRawValue() };
		const value = settingsFormValue['value'];
		delete settingsFormValue['value'];
		delete settingsFormValue.key;
		const newConfig: Config = {
			key: configKey,
			type: ConfigType.OAUTH2,
			collectionVersionId: currentCollectionId,
			settings: {
				...settingsFormValue,
				required: true,
			},
			value: value,
		};
		return newConfig;
	}

	saveConfigToCollection(config: Config): void {
		if (!this.configToUpdateWithIndex) {
			this.store.dispatch(CollectionActions.addConfig({ config: config }));
		} else {
			this.store.dispatch(
				CollectionActions.updateConfig({ config: config, configIndex: this.configToUpdateWithIndex.indexInList })
			);
		}
	}
	get authenticationSettingsControlsValid() {
		return Object.keys(this.settingsForm.controls)
			.filter(k => k !== 'value')
			.map(key => {
				return this.settingsForm.controls[key].valid;
			})
			.reduce((prev, next) => {
				return prev && next;
			}, true);
	}
}
