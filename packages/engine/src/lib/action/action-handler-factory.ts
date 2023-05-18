import { Action, ActionType, BranchAction, BranchResumeStepMetadata, LoopOnItemsAction, LoopResumeStepMetadata, ResumeStepMetadata, Trigger } from '@activepieces/shared'
import { BaseActionHandler } from './action-handler'
import { CodeActionHandler } from './code-action-handler'
import { PieceActionHandler } from './piece-action-handler'
import { LoopOnItemActionHandler } from './loop-action-handler'
import { BranchActionHandler } from './branch-action-handler'
import { isNil } from 'lodash'

type CreateActionHandlerParams = {
  action: Action | Trigger | undefined
  resumeStepMetadata?: ResumeStepMetadata
}

export function createActionHandler(params: CreateActionHandlerParams): BaseActionHandler<Action> | undefined {
  const { action, resumeStepMetadata } = params

  if (isNil(action)) {
    return undefined
  }

  const currentAction = action
  const nextAction = action.nextAction

  switch (currentAction.type) {
    case ActionType.CODE:
      return new CodeActionHandler({
        currentAction,
        nextAction,
      })

    case ActionType.PIECE:
      return new PieceActionHandler({
        currentAction,nextAction,
      })

    case ActionType.BRANCH:{
      const { onSuccessAction, onFailureAction } = action as BranchAction

      return new BranchActionHandler({
        currentAction,
        onSuccessAction,
        onFailureAction,
        nextAction,
        resumeStepMetadata: resumeStepMetadata as BranchResumeStepMetadata
      })
    }

    case ActionType.LOOP_ON_ITEMS: {
      const { firstLoopAction } = action as LoopOnItemsAction
      return new LoopOnItemActionHandler({
        currentAction,
        firstLoopAction,
        nextAction,
        resumeStepMetadata: resumeStepMetadata as LoopResumeStepMetadata,
      })
    }

    case ActionType.MISSING:
      throw new Error('Missing action, this should not happen')
  }

  return undefined
}
