import { ActionContext } from '../context';
import { ActionBase } from '../piece-metadata';
import { PieceAuthProperty, PiecePropertyMap } from '../property/property';

export type ActionRunner<PieceAuth extends PieceAuthProperty, ActionProps extends PiecePropertyMap> =
  (ctx: ActionContext<PieceAuth, ActionProps>) => Promise<unknown | void>

type CreateActionParams<PieceAuth extends PieceAuthProperty, ActionProps extends PiecePropertyMap> = {
  /**
   * A dummy parameter used to infer {@code PieceAuth} type
   */
  auth?: PieceAuth
  action: {
    name: string
    displayName: string
    description: string
    props: ActionProps
    run: ActionRunner<PieceAuth, ActionProps>
    sampleData?: unknown
  }
}

export class IAction<PieceAuth extends PieceAuthProperty, ActionProps extends PiecePropertyMap> implements ActionBase {
  constructor(
    public readonly name: string,
    public readonly displayName: string,
    public readonly description: string,
    public readonly props: ActionProps,
    public readonly run: ActionRunner<PieceAuth, ActionProps>,
    public readonly sampleData: unknown = {},
  ) {}
}

export type Action<
  PieceAuth extends PieceAuthProperty = any,
  ActionProps extends PiecePropertyMap = any,
> = IAction<PieceAuth, ActionProps>

export const createAction = <
  PieceAuth extends PieceAuthProperty = PieceAuthProperty,
  ActionProps extends PiecePropertyMap = PiecePropertyMap
>(
  params: CreateActionParams<PieceAuth, ActionProps>,
) => {
  return new IAction(
    params.action.name,
    params.action.displayName,
    params.action.description,
    params.action.props,
    params.action.run,
    params.action.sampleData,
  )
}
