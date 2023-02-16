import { StoreOperation, TriggerType, ActionType } from '@activepieces/shared';
declare type ConfigsAndTheirValues = { [key: string]: any };
interface InputFormsSchemaBase {
	type?: ActionType | TriggerType;
}
export interface LoopStepInputFormSchema extends InputFormsSchemaBase {
	items: string;
}
export interface CodeStepInputFormSchema extends InputFormsSchemaBase {
	artifact?: string;
	artifactSourceId: string;
	artifactPackagedId: string;
	input: Record<string, unknown>;
}

export interface StorageStepInputFormSchema extends InputFormsSchemaBase {
	operation: StoreOperation;
	key: string;
	value: string;
}

export interface ScheduledTriggerInputFormSchema extends InputFormsSchemaBase {
	cronExpression: string;
}

//TODO figure out a way to check the type of the (input form schema) because right now they are interfaces and instance of won't work since these are json objects from the server
export interface ComponentActionInputFormSchema extends InputFormsSchemaBase {
	pieceName: string;
	actionName: string;
	input: ConfigsAndTheirValues;
	inputUiInfo:
	{
		customizedInputs: Record<string, boolean>
	}
}
export interface ComponentTriggerInputFormSchema extends InputFormsSchemaBase {
	pieceName: string;
	triggerName: string;
	input: ConfigsAndTheirValues;
}


export type InputFormsSchema =
	| LoopStepInputFormSchema
	| StorageStepInputFormSchema
	| CodeStepInputFormSchema
	| ScheduledTriggerInputFormSchema
	| ComponentActionInputFormSchema;
