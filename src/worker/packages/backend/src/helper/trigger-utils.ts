import { pieces } from "pieces";
import { FlowVersion, PieceTrigger, Trigger, TriggerType as FlowTriggerType } from "shared";
import { TriggerType as PieceTriggerType } from "pieces";
import { ActivepiecesError, ErrorCode } from "./activepieces-error";

const PIECES_WEBHOOK_BASE_URL = "";

export const triggerUtils = {
    async enable(flowVersion: FlowVersion): Promise<void> {
        switch (flowVersion.trigger.type) {
            case FlowTriggerType.PIECE:
                await enablePieceTrigger(flowVersion);
                break;

            default:
                break;
        }
    },

    async disable(flowVersion: FlowVersion): Promise<void> {
        switch (flowVersion.trigger.type) {
            case FlowTriggerType.PIECE:
                await disablePieceTrigger(flowVersion);
                break;

            case FlowTriggerType.SCHEDULE:
                break;

            default:
                break;
        }
    },
};

const disablePieceTrigger = async (flowVersion: FlowVersion): Promise<void> => {
    const flowTrigger = flowVersion.trigger as PieceTrigger;
    const pieceTrigger = getPieceTrigger(flowTrigger);

    switch (pieceTrigger.type) {
        case PieceTriggerType.WEBHOOK:
            await pieceTrigger.onDisable({
                webhookUrl: `${PIECES_WEBHOOK_BASE_URL}/flow-version/${flowVersion.id}`,
                propsValue: flowTrigger.settings.input,
            });
            break;
    }
};

const enablePieceTrigger = async (flowVersion: FlowVersion): Promise<void> => {
    const flowTrigger = flowVersion.trigger as PieceTrigger;
    const pieceTrigger = getPieceTrigger(flowTrigger);

    switch (pieceTrigger.type) {
        case PieceTriggerType.WEBHOOK:
            await pieceTrigger.onEnable({
                webhookUrl: `${PIECES_WEBHOOK_BASE_URL}/flow-version/${flowVersion.id}`,
                propsValue: flowTrigger.settings.input,
            });
            break;
    }
};

const getPieceTrigger = (trigger: PieceTrigger) => {
    const piece = pieces.find(p => p.name === trigger.settings.pieceName);

    if (!piece) {
        throw new ActivepiecesError({
            code: ErrorCode.PIECE_NOT_FOUND,
            params: {
                pieceName: trigger.settings.pieceName,
            },
        });
    }

    const pieceTrigger = piece.getTrigger(trigger.settings.triggerName);

    if (!pieceTrigger) {
        throw new ActivepiecesError({
            code: ErrorCode.PIECE_TRIGGER_NOT_FOUND,
            params: {
                pieceName: trigger.settings.pieceName,
                triggerName: trigger.settings.triggerName,
            },
        });
    }

    return pieceTrigger;
};
