import {
  CollectionVersion,
  CollectionVersionState,
  FlowVersion,
  FlowVersionState,
  Instance,
  InstanceStatus,
} from "@activepieces/shared";
import { In } from "typeorm";
import { collectionVersionService } from "../collections/collection-version/collection-version.service";
import { flowVersionRepo } from "../flows/flow-version/flow-version-repo";
import { triggerUtils } from "../helper/trigger-utils";

export const instanceSideEffects = {
  async enable(instance: Instance): Promise<void> {
    if (
      instance.status === InstanceStatus.DISABLED ||
      instance.flowIdToVersionId == null ||
      instance.collectionVersionId == null
    ) {
      return;
    }
    const collectionVersion = (await collectionVersionService.getOne(instance.collectionVersionId))!;

    const flowVersionIds = Object.values(instance.flowIdToVersionId);

    const flowVersions = await flowVersionRepo.findBy({
      id: In(flowVersionIds),
    });

    await lockVersions({
      collectionVersion,
      flowVersions,
    });

    const enableTriggers = flowVersions.map(
      async (flowVersion) =>
        await triggerUtils.enable({
          collectionId: instance.collectionId,
          collectionVersion: collectionVersion,
          projectId: instance.projectId,
          flowVersion,
        })
    );

    await Promise.all(enableTriggers);
  },

  async disable(instance: Partial<Instance>): Promise<void> {
    if (instance.status === InstanceStatus.DISABLED || instance.flowIdToVersionId == null) {
      return;
    }

    const collectionVersion = (await collectionVersionService.getOne(instance.collectionVersionId!))!;
    const flowVersionIds = Object.values(instance.flowIdToVersionId);

    const flowVersions = await flowVersionRepo.findBy({
      id: In(flowVersionIds),
    });
    const disableTriggers = flowVersions.map((version) => triggerUtils.disable({ collectionId: instance.collectionId!, flowVersion: version, projectId: instance.projectId!, collectionVersion }));
    await Promise.all(disableTriggers);
  },
};

const lockVersions = async ({ collectionVersion, flowVersions }: LockVersionsParams): Promise<void> => {
  collectionVersion.state = CollectionVersionState.LOCKED;

  flowVersions.forEach((flowVersion) => {
    flowVersion.state = FlowVersionState.LOCKED;
  });

  const saveLockedVersions = [
    collectionVersionService.updateVersion(collectionVersion.id, collectionVersion),
    flowVersionRepo.save(flowVersions),
  ];

  await Promise.all(saveLockedVersions);
};

interface LockVersionsParams {
  collectionVersion: CollectionVersion;
  flowVersions: FlowVersion[];
}
