import { FastifyInstance, FastifyRequest } from 'fastify'
import {
    CreateFlowRequest,
    FlowId,
    FlowOperationRequest,
    FlowVersionId,
    ListFlowsRequest,
} from '@activepieces/shared'
import { StatusCodes } from 'http-status-codes'
import { ActivepiecesError, ErrorCode } from '@activepieces/shared'
import { flowService } from './flow.service'
import { CountFlowsRequest } from '@activepieces/shared'


const DEFUALT_PAGE_SIZE = 10

export const flowController = async (fastify: FastifyInstance) => {
    fastify.post(
        '/',
        {
            schema: {
                body: CreateFlowRequest,
            },
        },
        async (
            request: FastifyRequest<{
                Body: CreateFlowRequest
            }>,
        ) => {
            return await flowService.create({ projectId: request.principal.projectId, request: request.body })
        },
    )

    fastify.post(
        '/:flowId',
        {
            schema: {
                body: FlowOperationRequest,
            },
        },
        async (
            request: FastifyRequest<{
                Params: {
                    flowId: FlowId
                }
                Body: FlowOperationRequest
            }>,
        ) => {
            const flow = await flowService.getOne({ id: request.params.flowId, versionId: undefined, projectId: request.principal.projectId, includeArtifacts: false })
            if (flow === null) {
                throw new ActivepiecesError({ code: ErrorCode.FLOW_NOT_FOUND, params: { id: request.params.flowId } })
            }
            return await flowService.update({ flowId: request.params.flowId, request: request.body, projectId: request.principal.projectId })
        },
    )

    fastify.get(
        '/',
        {
            schema: {
                querystring: ListFlowsRequest,
            },
        },
        async (
            request: FastifyRequest<{
                Querystring: ListFlowsRequest
            }>,
        ) => {
            const flows = await flowService.list({
                projectId: request.principal.projectId,
                folderId: request.query.folderId,
                cursorRequest: request.query.cursor ?? null,
                limit: request.query.limit ?? DEFUALT_PAGE_SIZE,
            })
            return flows
        },
    )

    fastify.get(
        '/count',
        async (
            request: FastifyRequest<{
                Querystring: CountFlowsRequest
            }>,
        ) => {
            return flowService.count({ ...request.query, projectId: request.principal.projectId })
        },
    )


    fastify.get(
        '/:flowId',
        async (
            request: FastifyRequest<{
                Params: {
                    flowId: FlowId
                }
                Querystring: {
                    versionId: FlowVersionId | undefined
                    includeArtifacts: boolean | undefined
                }
            }>,
        ) => {
            const versionId: FlowVersionId | undefined = request.query.versionId
            const includeArtifacts = request.query.includeArtifacts ?? false
            const flow = await flowService.getOne({ id: request.params.flowId, versionId: versionId, projectId: request.principal.projectId, includeArtifacts })
            if (flow === null) {
                throw new ActivepiecesError({ code: ErrorCode.FLOW_NOT_FOUND, params: { id: request.params.flowId } })
            }
            return flow
        },
    )

    fastify.delete(
        '/:flowId',
        async (
            request: FastifyRequest<{
                Params: {
                    flowId: FlowId
                }
            }>,
            _reply,
        ) => {
            await flowService.delete({ projectId: request.principal.projectId, flowId: request.params.flowId })
            _reply.status(StatusCodes.OK).send()
        },
    )

}
