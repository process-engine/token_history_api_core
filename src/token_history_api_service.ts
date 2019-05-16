import {
  ITokenHistoryApi,
  TokenEventType,
  TokenHistoryEntry,
  TokenHistoryGroup,
} from '@process-engine/token_history_api_contracts';

import {FlowNodeInstance, IFlowNodeInstanceRepository, ProcessToken} from '@process-engine/flow_node_instance.contracts';

import {IIAMService, IIdentity} from '@essential-projects/iam_contracts';

export class TokenHistoryApiService implements ITokenHistoryApi {

  private _iamService: IIAMService;
  private _flowNodeInstanceRepository: IFlowNodeInstanceRepository;

  constructor(iamService: IIAMService, flowNodeInstanceRepository: IFlowNodeInstanceRepository) {
    this._iamService = iamService;
    this._flowNodeInstanceRepository = flowNodeInstanceRepository;
  }

  // TODO: Add claim checks as soon as required claims have been defined.
  public async getTokensForFlowNode(
    identity: IIdentity,
    correlationId: string,
    processModelId: string,
    flowNodeId: string,
  ): Promise<Array<TokenHistoryEntry>> {

    const flowNodeInstance: FlowNodeInstance =
      await this._flowNodeInstanceRepository.querySpecificFlowNode(correlationId, processModelId, flowNodeId);

    const tokenHistory: Array<TokenHistoryEntry> = this._getTokenHistoryForFlowNode(flowNodeInstance);

    return tokenHistory;
  }

  public async getTokensForFlowNodeByProcessInstanceId(
    identity: IIdentity,
    processInstanceId: string,
    flowNodeId: string,
  ): Promise<TokenHistoryGroup> {

    const flowNodeInstances: Array<FlowNodeInstance> =
      await this._flowNodeInstanceRepository.queryFlowNodeInstancesByProcessInstanceId(processInstanceId, flowNodeId);

    const tokenHistories: TokenHistoryGroup = this._createTokenHistories(flowNodeInstances);

    return tokenHistories;
  }

  // TODO: Add claim checks as soon as required claims have been defined.
  public async getTokensForCorrelationAndProcessModel(
    identity: IIdentity,
    correlationId: string,
    processModelId: string,
  ): Promise<TokenHistoryGroup> {

    const flowNodeInstances: Array<FlowNodeInstance> =
      await this._flowNodeInstanceRepository.queryByCorrelationAndProcessModel(correlationId, processModelId);

    const tokenHistories: TokenHistoryGroup = this._createTokenHistories(flowNodeInstances);

    return tokenHistories;
  }

  // TODO: Add claim checks as soon as required claims have been defined.
  public async getTokensForProcessInstance(identity: IIdentity, processInstanceId: string): Promise<TokenHistoryGroup> {

    const flowNodeInstances: Array<FlowNodeInstance> =
      await this._flowNodeInstanceRepository.queryByProcessInstance(processInstanceId);

    const tokenHistories: TokenHistoryGroup = this._createTokenHistories(flowNodeInstances);

    return tokenHistories;
  }

  private _createTokenHistories(flowNodeInstances: Array<FlowNodeInstance>): TokenHistoryGroup {
    const tokenHistories: TokenHistoryGroup = {};

    flowNodeInstances.forEach((flowNodeInstance: FlowNodeInstance) => {
      const tokenHistory: Array<TokenHistoryEntry> = this._getTokenHistoryForFlowNode(flowNodeInstance);
      tokenHistory.sort((first: TokenHistoryEntry, second: TokenHistoryEntry) => {

        const firstTypeIsOnEnter: boolean = first.tokenEventType === TokenEventType.onEnter;
        const firstTypeIsOnExit: boolean = first.tokenEventType === TokenEventType.onExit;
        const firstTypeIsOnResume: boolean = first.tokenEventType === TokenEventType.onResume;
        const secondTypeIsOnResume: boolean = second.tokenEventType === TokenEventType.onResume;
        const secondTypeIsOnSuspend: boolean = second.tokenEventType === TokenEventType.onSuspend;

        if (firstTypeIsOnEnter) {
          return -1;
        }

        if (firstTypeIsOnExit && secondTypeIsOnResume) {
          return 1;
        }

        if (firstTypeIsOnExit && secondTypeIsOnSuspend) {
          return 1;
        }

        if (firstTypeIsOnResume && secondTypeIsOnSuspend) {
          return 1;
        }
      });

      const flowNodeId: string = flowNodeInstance.flowNodeId;

      const flowNodeIdExist: boolean = tokenHistories[flowNodeId] !== null
                                    && tokenHistories[flowNodeId] !== undefined;

      if (flowNodeIdExist) {
        tokenHistories[flowNodeId].push(...tokenHistory);
      } else {
        tokenHistories[flowNodeId] = tokenHistory;
      }
    });

    return tokenHistories;
  }

  private _getTokenHistoryForFlowNode(flowNodeInstance: FlowNodeInstance): Array<TokenHistoryEntry> {
    const tokenHistory: Array<TokenHistoryEntry> = flowNodeInstance.tokens.map((fniToken: ProcessToken): TokenHistoryEntry => {

      const tokenHistoryEntry: TokenHistoryEntry = new TokenHistoryEntry();
      tokenHistoryEntry.flowNodeId = flowNodeInstance.flowNodeId;
      tokenHistoryEntry.flowNodeInstanceId = flowNodeInstance.id;
      tokenHistoryEntry.previousFlowNodeInstanceId = flowNodeInstance.previousFlowNodeInstanceId;
      tokenHistoryEntry.processInstanceId = fniToken.processInstanceId;
      tokenHistoryEntry.processModelId = fniToken.processModelId;
      tokenHistoryEntry.correlationId = fniToken.correlationId;
      tokenHistoryEntry.tokenEventType = TokenEventType[fniToken.type];
      tokenHistoryEntry.identity = fniToken.identity;
      tokenHistoryEntry.createdAt = fniToken.createdAt;
      tokenHistoryEntry.caller = fniToken.caller;
      tokenHistoryEntry.payload = fniToken.payload;

      return tokenHistoryEntry;
    });

    return tokenHistory;
  }
}
