import { FlowExecutor } from './lib/executors/flow-executor';
import { Utils } from './lib/utils';
import { globals } from './lib/globals';
import { EngineOperationType, ExecutePropsOptions, ExecuteFlowOperation, ExecuteTriggerOperation, ExecutionState } from '@activepieces/shared';
import { pieceHelper } from './lib/helper/piece-helper';

const args = process.argv.slice(2);

const executeFlow = async (): Promise<void> => {
  try {
    const input: ExecuteFlowOperation = Utils.parseJsonFile(globals.inputFile);

    globals.workerToken = input.workerToken!;
    globals.projectId = input.projectId;
    globals.apiUrl = input.apiUrl!;

    const executionState = new ExecutionState();
    executionState.insertStep(input.triggerPayload!, 'trigger', []);
    const executor = new FlowExecutor(executionState);
    const output = await executor.executeFlow(input.collectionVersionId, input.flowVersionId);
    Utils.writeToJsonFile(globals.outputFile, output);
  } catch (e) {
    console.error(e);
    Utils.writeToJsonFile(globals.outputFile, (e as Error).message);
  }
}

const executeProps = async (): Promise<void> => {
  try {
    const input: ExecutePropsOptions = Utils.parseJsonFile(globals.inputFile);

    globals.workerToken = input.workerToken!;
    globals.projectId = input.projectId;
    globals.apiUrl = input.apiUrl!;

    const output = await pieceHelper.executeProps(input);
    Utils.writeToJsonFile(globals.outputFile, output);
  }
  catch (e) {
    console.error(e);
    Utils.writeToJsonFile(globals.outputFile, (e as Error).message);
  }
}

const executeTrigger = async (): Promise<void> => {
  try {
    const input: ExecuteTriggerOperation = Utils.parseJsonFile(globals.inputFile);

    globals.workerToken = input.workerToken!;
    globals.projectId = input.projectId;
    globals.apiUrl = input.apiUrl!;

    const output = await pieceHelper.executeTrigger(input);
    Utils.writeToJsonFile(globals.outputFile, output ?? "");
  }
  catch (e) {
    console.error(e);
    Utils.writeToJsonFile(globals.outputFile, (e as Error).message);
  }
}

async function execute() {
  switch (args[0]) {
    case EngineOperationType.EXECUTE_FLOW:
      executeFlow();
      break;
    case EngineOperationType.EXECUTE_PROPERTY:
      executeProps();
      break;
    case EngineOperationType.EXECUTE_TRIGGER_HOOK:
      executeTrigger();
      break;
    default:
      console.error('unknown operation');
      break;
  }
}

execute();
