import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { ActionType, FlowId, GetPieceRequestParams, GetPieceRequestQuery, PieceOptionRequest, ProjectId, TriggerType, flowHelper } from '@activepieces/shared'
import { engineHelper } from '../helper/engine-helper'
import { pieceMetadataLoader } from './piece-metadata-loader'
import { flowInstanceService } from '../flows/flow-instance/flow-instance.service'
import { isNil } from 'lodash'
import { flowService } from '../flows/flow/flow.service'
import { flowRepo } from '../flows/flow/flow.repo'
import { system } from '../helper/system/system'
import { SystemProp } from '../helper/system/system-prop'


type PieceStats = {
    activeSteps: number
    allSteps: number
    uniqueProjects: number
    allFlows: number
    activeFlows: number
}

const statsEnabled = system.get(SystemProp.STATS_ENABLED) ?? false

export const piecesController: FastifyPluginAsync = async (app) => {

    app.post(
        '/v1/pieces/:pieceName/options',
        {
            schema: {
                body: PieceOptionRequest,
            },
        },
        async (
            request: FastifyRequest<{
                Params: { pieceName: string }
                Body: PieceOptionRequest
            }>,
        ) => {
            return engineHelper.executeProp({
                pieceName: request.params.pieceName,
                pieceVersion: request.body.pieceVersion,
                propertyName: request.body.propertyName,
                stepName: request.body.stepName,
                input: request.body.input,
                projectId: request.principal.projectId,
            })
        },
    )

    app.get('/v1/pieces/stats', async (_request, reply) => {
        if (!statsEnabled) {
            reply.code(404).send()
        }
        else {
            reply.code(200).send(await stats())
        }
    })

    app.get('/v1/pieces', async () => {
        return await pieceMetadataLoader.manifest()
    })

    app.get(
        '/v1/pieces/:name',
        {
            schema: {
                params: GetPieceRequestParams,
                querystring: GetPieceRequestQuery,
            },
        },
        async (
            request: FastifyRequest<{
                Params: GetPieceRequestParams
                Querystring: GetPieceRequestQuery
            }>,
        ) => {
            const { name } = request.params
            const { version } = request.query
            return await pieceMetadataLoader.pieceMetadata(name, version)
        },
    )
}

async function stats(): Promise<Record<string, PieceStats>> {
    const flows = await flowRepo.find()
    const stats: Record<string, PieceStats> = {}
    const uniqueStatsPerPiece: Record<string, {
        flows: Set<FlowId>
        projects: Set<ProjectId>
        activeFlows: Set<FlowId>
    }> = {}
    const defaultStats = { activeSteps: 0, allSteps: 0, uniqueProjects: 0, activeFlows: 0, allFlows: 0 }
    const pieces = await pieceMetadataLoader.manifest()
    for (const piece of pieces) {
        uniqueStatsPerPiece[piece.name] = {
            flows: new Set(),
            projects: new Set(),
            activeFlows: new Set(),
        }
        stats[piece.name] = { ...defaultStats }
    }
    for (const flowWithoutVersion of flows) {
        const flow = await flowService.getOneOrThrow({ id: flowWithoutVersion.id, projectId: flowWithoutVersion.projectId })
        if (isNil(flow.version.trigger)) {
            continue
        }
        const isEnabled = !isNil(await flowInstanceService.get({ projectId: flow.projectId, flowId: flow.id }))
        const steps = flowHelper.getAllSteps(flow.version)
        for (const step of steps) {
            if (step.type === TriggerType.PIECE || step.type === ActionType.PIECE) {
                if (!stats[step.settings.pieceName]) {
                    uniqueStatsPerPiece[step.settings.pieceName] = {
                        flows: new Set(),
                        projects: new Set(),
                        activeFlows: new Set(),
                    }
                    stats[step.settings.pieceName] = { ...defaultStats }
                }
                uniqueStatsPerPiece[step.settings.pieceName].projects.add(flow.projectId)
                uniqueStatsPerPiece[step.settings.pieceName].flows.add(flow.id)
                stats[step.settings.pieceName].allSteps++
                if (isEnabled) {
                    uniqueStatsPerPiece[step.settings.pieceName].activeFlows.add(flow.id)
                    stats[step.settings.pieceName].activeSteps++
                }
            }

        }
    }
    for (const pieceName in uniqueStatsPerPiece) {
        stats[pieceName].uniqueProjects = uniqueStatsPerPiece[pieceName].projects.size
        stats[pieceName].allFlows = uniqueStatsPerPiece[pieceName].flows.size
        stats[pieceName].activeFlows = uniqueStatsPerPiece[pieceName].activeFlows.size
    }
    return stats
}
