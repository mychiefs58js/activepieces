import { CollectionId, FlowId, Instance, RunEnvironment, TriggerType } from "@activepieces/shared";
import { collectionService } from "../collections/collection.service";
import { flowRunService } from "../flow-run/flow-run-service";
import { flowService } from "../flows/flow-service";
import { flowVersionService } from "../flows/flow-version/flow-version.service";
import { ActivepiecesError, ErrorCode } from "@activepieces/shared";
import { triggerUtils } from "../helper/trigger-utils";
import { instanceService } from "../instance/instance-service";
import { collectionVersionService } from "../collections/collection-version/collection-version.service";

export const webhookService = {
  async callback({ flowId, payload }: CallbackParams): Promise<void> {
    const flow = await flowService.getOneOrThrow(flowId);
    const collection = await collectionService.getOneOrThrow(flow.collectionId);
    const instance = await getInstanceOrThrow(collection.id);
    const collectionVersion = await collectionVersionService.getOneOrThrow(instance.collectionVersionId);

    const flowVersion = await flowVersionService.getOneOrThrow(instance.flowIdToVersionId[flow.id]);
    let payloads: any[] = await triggerUtils.executeTrigger({
      projectId: collection.projectId,
      collectionVersion: collectionVersion,
      flowVersion: flowVersion,
      payload: payload,
    });


    console.log(`Triggers returned a ${payloads.length} payloads`);

    const createFlowRuns = payloads.map((payload) =>
      flowRunService.start({
        environment: RunEnvironment.PRODUCTION,
        collectionVersionId: instance.collectionVersionId,
        flowVersionId: flowVersion.id,
        payload,
      })
    );

    await Promise.all(createFlowRuns);
  },
};

const getInstanceOrThrow = async (collectionId: CollectionId): Promise<Instance> => {
  const instance = await instanceService.getByCollectionId({ collectionId });

  if (instance === null) {
    throw new ActivepiecesError({
      code: ErrorCode.INSTANCE_NOT_FOUND,
      params: {
        collectionId,
      },
    });
  }

  return instance;
};

interface CallbackParams {
  flowId: FlowId;
  payload: unknown;
}
