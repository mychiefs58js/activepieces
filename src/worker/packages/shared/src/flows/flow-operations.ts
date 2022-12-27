import {
    ActionType, CodeActionSettings, LoopOnItemsActionSettings, PieceActionSettings, StorageActionSettings,
} from "./actions/action";
import {ComponentTriggerSettings, ScheduleTriggerSettings, TriggerType} from "./triggers/trigger";


export enum FlowOperationType {
    CHANGE_NAME = "CHANGE_NAME",
    UPDATE_TRIGGER = "UPDATE_TRIGGER",
    ADD_ACTION = "ADD_ACTION",
    UPDATE_ACTION = "UPDATE_ACTION",
    DELETE_ACTION = "DELETE_ACTION"
}

export type FlowOperationRequest = BasicOperationRequest<FlowOperationType.UPDATE_TRIGGER, UpdateTriggerRequest>
    | BasicOperationRequest<FlowOperationType.ADD_ACTION, AddActionRequest>
    | BasicOperationRequest<FlowOperationType.UPDATE_ACTION, UpdateActionRequest>
    | BasicOperationRequest<FlowOperationType.CHANGE_NAME, ChangeNameRequest>
    | BasicOperationRequest<FlowOperationType.DELETE_ACTION, DeleteActionRequest>;

export type ChangeNameRequest = {
    displayName: string;
}

export type DeleteActionRequest = {
    name: string
}

export type AddActionRequest = {
    parentAction: string,
    action: UpdateActionRequest
}

export type UpdateActionRequest = BasicActionStep<ActionType.STORAGE, StorageActionSettings>
    | BasicActionStep<ActionType.CODE, CodeActionSettings>
    | BasicActionStep<ActionType.LOOP_ON_ITEMS, LoopOnItemsActionSettings>
    | BasicActionStep<ActionType.PIECE, PieceActionSettings>;


interface BasicActionStep<A, V> {
    type: A;
    settings: V;
    name: string,
    displayName: string;
}

export type UpdateTriggerRequest = BasicTriggerRequest<TriggerType.WEBHOOK, {}>
    | BasicTriggerRequest<TriggerType.SCHEDULE, ScheduleTriggerSettings>
    | BasicTriggerRequest<TriggerType.EMPTY, {}>
    | BasicTriggerRequest<TriggerType.COMPONENT, ComponentTriggerSettings>


interface BasicTriggerRequest<A, V> {
    type: A;
    settings: V;
    displayName: string;
}

interface BasicOperationRequest<T extends FlowOperationType, V> {
    type: T;
    request: V;
}
