import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import {
	ControlValueAccessor,
	UntypedFormBuilder,
	UntypedFormControl,
	UntypedFormGroup,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	Validators,
} from '@angular/forms';

import {  map, Observable, of, pairwise, startWith, Subject, switchMap, tap } from 'rxjs';
import { ActionMetaService } from 'packages/frontend/src/app/modules/flow-builder/service/action-meta.service';
import { fadeInUp400ms } from 'packages/frontend/src/app/modules/common/animation/fade-in-up.animation';
import { ComponentActionInputFormSchema } from '../../input-forms-schema';
import { DropdownItem } from 'packages/frontend/src/app/modules/common/model/dropdown-item.interface';
import { PieceConfig, propsConvertor } from 'packages/frontend/src/app/modules/common/components/configs-form/connector-action-or-config';
import { Config, PieceActionSettings } from '@activepieces/shared';
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
	[ACTION_FORM_CONTROL_NAME]: string,
	[CONFIGS_FORM_CONTROL_NAME]: ConfigsFormControlValue
}
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
export class PieceActionInputFormComponent implements ControlValueAccessor,AfterViewInit {
	readonly ACTION_FORM_CONTROL_NAME = ACTION_FORM_CONTROL_NAME;
	readonly CONFIGS_FORM_CONTROL_NAME = CONFIGS_FORM_CONTROL_NAME;
	componentForm: UntypedFormGroup;
	initialSetup$: Observable<ActionDropdownOption[]>;
	triggerInitialSetup$:Subject<true>= new Subject();
	pieceName: string;
	intialComponentInputFormValue: ComponentActionInputFormSchema | null;
	selectedAction$: Observable<any>;
	actions$: Observable<ActionDropdownOption[]>;
	valueChanges$: Observable<void>;
	actionDropdownValueChanged$: Observable<{ actionName: string; configs: PieceConfig[] }>;
	updateOrAddConfigModalClosed$: Observable<Config>;
	allAuthConfigs$: Observable<DropdownItem[]>;
	onChange = (value: any) => { ; };
	onTouch = () => { ; };

	constructor(
		private fb: UntypedFormBuilder,
		private actionMetaDataService: ActionMetaService,
		private cd: ChangeDetectorRef
	) {
		this.buildForm();
		this.actionDropdownValueChanged$ = this.componentForm.get(ACTION_FORM_CONTROL_NAME)!.valueChanges.pipe(
			tap(val => {
				this.actionSelectValueChanged(val);
			})
		);
	}
	ngAfterViewInit(): void {
		this.triggerInitialSetup$.next(true);
	}


	private buildForm() {
		this.componentForm = this.fb.group({
			[ACTION_FORM_CONTROL_NAME]: new UntypedFormControl(null, Validators.required),
		});
		this.componentForm.markAllAsTouched();

		this.valueChanges$ = this.componentForm.valueChanges.pipe(
			startWith(null),
			pairwise(),
			tap((oldAndCurrentValues: [ComponentFormValue | null, ComponentFormValue]) => {
				this.onChange(this.getFormattedFormData(oldAndCurrentValues));
			}),
			map(() => void 0)
		);
	}

	fetchActions(pieceName: string) {
		const pieces$ = this.actionMetaDataService.getPieces().pipe(
			map(pieces => {
				const component = pieces.find(c => c.name === pieceName);
				if (!component) {
					throw new Error(`Activepieces- piece not found: ${pieceName}`);
				}
				return component;
			})
		);
		this.actions$ = pieces$.pipe(
			map(component => {
				const actionsKeys = Object.keys(component.actions);
				return actionsKeys.map(actionName => {
					const action = component.actions[actionName];
					const configs = Object.entries(action.props).map(keyEntry => {
						return propsConvertor.convertToFrontEndConfig(keyEntry[0], keyEntry[1]);
					});
					return {
						value: {
							actionName: actionName,
							configs: configs,
						},
						label: { name: action.displayName, description: action.description },
					};
				});
			})
		);
		this.initialSetup$ =this.triggerInitialSetup$.pipe(switchMap(()=>{
			return	this.actions$.pipe(
						tap(items => {
							if (this.intialComponentInputFormValue && this.intialComponentInputFormValue.actionName) {
								this.componentForm
									.get(ACTION_FORM_CONTROL_NAME)!
									.setValue(items.find(i => i.value.actionName === this.intialComponentInputFormValue?.actionName)?.value, {
										emitEvent: false,
									});
								this.selectedAction$ = of(
									items.find(it => it.value.actionName === this.intialComponentInputFormValue!.actionName)
								).pipe(
									tap(selectedAction => {
										if (selectedAction) {
											const configs = [...selectedAction.value.configs];
											const configsValues = this.intialComponentInputFormValue!.input;
			
											if (configsValues) {
												Object.keys(configsValues).forEach(key => {
													const config = configs.find(c => c.key === key);
													if (config) {
														config.value = configsValues[key];
													}
												});
											}
											this.componentForm.addControl(CONFIGS_FORM_CONTROL_NAME,
												new UntypedFormControl({
													value: { configs: [...configs], customizedInputs: this.intialComponentInputFormValue!.inputUiInfo?.customizedInputs || {} },
													disabled: this.componentForm.disabled
												}), {
												emitEvent: false
											});
											this.cd.detectChanges();
										}
									})
							
								);
							}
						})
					);
		}));
		this.triggerInitialSetup$.next(true);
	}
	writeValue(obj: ComponentActionInputFormSchema): void {
		this.intialComponentInputFormValue = obj;
		this.pieceName = obj.pieceName;
		this.componentForm.get(ACTION_FORM_CONTROL_NAME)?.setValue(undefined, { emitEvent: false });
		this.componentForm.removeControl(CONFIGS_FORM_CONTROL_NAME, { emitEvent: false });
		this.fetchActions(obj.pieceName);
	}


	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouch = fn;
	}

	validate() {
		if (this.componentForm.valid) return null;
		return { invalid: true };
	}

	actionSelectValueChanged(selectedActionValue: { actionName: string; configs: PieceConfig[] } | null) {
		if (selectedActionValue) {
			this.actionSelected(selectedActionValue);
			this.selectedAction$ = this.actions$.pipe(
				map(items => {
					return items.find(it => it.value.actionName === selectedActionValue.actionName);
				})
			);
		}
	}

	private actionSelected(selectedActionValue: { actionName: string; configs: PieceConfig[] }) {
		const configsForm = this.componentForm.get(CONFIGS_FORM_CONTROL_NAME);
		if (!configsForm) {
			this.componentForm.addControl(
				CONFIGS_FORM_CONTROL_NAME,
				new UntypedFormControl({ configs: [...selectedActionValue.configs], customizedInputs: {} })
			);
		} else {
			configsForm.setValue({ configs: [...selectedActionValue.configs], customizedInputs: {} });
		}

		this.cd.detectChanges();
		this.componentForm.updateValueAndValidity();
	}

	getFormattedFormData(oldAndCurrentValues: [ComponentFormValue | null, ComponentFormValue]): PieceActionSettings {
		let customizedInputs: Record<string, boolean>;
		if (oldAndCurrentValues[0] && oldAndCurrentValues[0][ACTION_FORM_CONTROL_NAME] !== oldAndCurrentValues[1][ACTION_FORM_CONTROL_NAME]) {
			customizedInputs = {};
		}
		else {
			customizedInputs = oldAndCurrentValues[1][CONFIGS_FORM_CONTROL_NAME].customizedInputs;
		}
		const action: ActionDropdownOptionValue = this.componentForm.get(ACTION_FORM_CONTROL_NAME)!.value;
		const configs: ConfigsFormControlValue = this.componentForm.get(CONFIGS_FORM_CONTROL_NAME)?.value || {};
		const res = {
			actionName: action?.actionName,
			input: {
				...configs.input,
			},
			pieceName: this.pieceName,
			inputUiInfo: { customizedInputs: customizedInputs }
		};

		return res;
	}
	actionDropdownCompareFn(item, selected) {
		return item.actionName === selected?.actionName;
	}
	setDisabledState?(isDisabled: boolean): void {

		if (isDisabled) {
			this.componentForm.disable();
		} else {
			this.componentForm.enable();
		}
	}
}
