import { createAction, props } from '@ngrx/store';
import {
  AppConnection,
  FlowBuilderDto,
  FlowInstance,
  FlowRun,
} from '@activepieces/shared';
import { ViewModeEnum } from '../../model/enums/view-mode.enum';

export enum BuilderActionType {
  LOAD_INITIAL = '[BUILDER] LOAD_INITIAL',
}

export const loadInitial = createAction(
  BuilderActionType.LOAD_INITIAL,
  props<{
    flow: FlowBuilderDto;
    instance?: FlowInstance;
    viewMode: ViewModeEnum;
    run?: FlowRun;
    appConnections: AppConnection[];
  }>()
);

export const BuilderActions = {
  loadInitial,
};
