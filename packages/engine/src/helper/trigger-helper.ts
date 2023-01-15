import { pieces, Store } from "pieces";
import { ExecuteTriggerOperation, ExecutionState, PieceTrigger, TriggerHookType } from "shared";
import { storageService } from "../services/storage.service";
import { VariableService } from "../services/variable-service";

export const triggerHelper = {
  async executeTrigger(params: ExecuteTriggerOperation) {
    const flowTrigger: PieceTrigger = params.flowVersion.trigger as PieceTrigger;
    const trigger = pieces.find((p) => p.name === flowTrigger.settings.pieceName)?.getTrigger(flowTrigger.settings.triggerName);
    if (trigger === undefined) {
      throw new Error(`Piece trigger is not found ${flowTrigger.settings.triggerName} and piece name ${flowTrigger.settings.pieceName}`)
    }
    const variableService = new VariableService();
    const executionState = new ExecutionState();
    executionState.insertConfigs(params.collectionVersion);
    const resolvedInput = await variableService.resolve(flowTrigger.settings.input, executionState);

    let context = {
      store: createContextStore(),
      webhookUrl: params.webhookUrl,
      propsValue: resolvedInput,
      payload: params.triggerPayload,
    };
    switch (params.hookType) {
      case TriggerHookType.ON_DISABLE:
        return trigger.onDisable(context);
      case TriggerHookType.ON_ENABLE:
        return trigger.onEnable(context);
      case TriggerHookType.RUN:
        return trigger.run(context);
    }
  },
}

function createContextStore(): Store {
  return {
    save: async function <T>(key: string, value: T): Promise<T> {
      const storeEntry = await storageService.put({
        key: key,
        value: value,
      });
      return value;
    },
    get: async function <T>(key: string): Promise<T | null> {
      const storeEntry = await storageService.get(key);
      if (storeEntry === null) {
        return null;
      }
      return storeEntry.value as T;
    },
  };
}
