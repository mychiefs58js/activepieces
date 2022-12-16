import {ExecutionState} from '../../execution/execution-state';
import {StepOutput, StepOutputStatus} from '../../output/step-output';
import {VariableService} from '../../../services/variable-service';
import {StoreScope} from '../../util/store-scope';
import {ActionMetadata, ActionType} from "../action-metadata";

export class ResponseActionSettings {
  output: any;

  constructor(output: any) {
    this.output = output;
  }

  static deserialize(jsonData: any): ResponseActionSettings {
    return new ResponseActionSettings(jsonData['output']);
  }
}

export class ResponseAction extends ActionMetadata {
  variableService: VariableService;
  settings: ResponseActionSettings;

  constructor(
    type: ActionType,
    name: string,
    settings: ResponseActionSettings,
    nextAction?: ActionMetadata
  ) {
    super(type, name, nextAction);
    this.settings = settings;
    this.variableService = new VariableService();
  }

  execute(
    executionState: ExecutionState,
    ancestors: [string, number][],
    storeScope: StoreScope
  ): Promise<StepOutput> {
    const stepOutput = new StepOutput();
    stepOutput.output = this.variableService.resolve(
      this.settings.output,
      executionState
    );
    stepOutput.status = StepOutputStatus.SUCCEEDED;
    return Promise.resolve(stepOutput);
  }
}
