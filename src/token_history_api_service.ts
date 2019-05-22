import {
  ITokenHistoryApi,
  TokenEventType,
  TokenHistoryEntry,
  TokenHistoryGroup,
} from '@process-engine/token_history_api_contracts';

import {FlowNodeInstance, IFlowNodeInstanceRepository, ProcessToken} from '@process-engine/flow_node_instance.contracts';

import {IIAMService, IIdentity} from '@essential-projects/iam_contracts';

export class TokenHistoryApiService implements ITokenHistoryApi {

  private iamService: IIAMService;
  private flowNodeInstanceRepository: IFlowNodeInstanceRepository;

  constructor(iamService: IIAMService, flowNodeInstanceRepository: IFlowNodeInstanceRepository) {
    this.iamService = iamService;
    this.flowNodeInstanceRepository = flowNodeInstanceRepository;
  }

  // TODO: Add claim checks as soon as required claims have been defined.
  public async getTokensForFlowNode(
    identity: IIdentity,
    correlationId: string,
    processModelId: string,
    flowNodeId: string,
  ): Promise<Array<TokenHistoryEntry>> {

    const flowNodeInstance = await this.flowNodeInstanceRepository.querySpecificFlowNode(correlationId, processModelId, flowNodeId);

    const tokenHistory = this.getTokenHistoryForFlowNode(flowNodeInstance);

    return tokenHistory;
  }

  public async getTokensForFlowNodeByProcessInstanceId(
    identity: IIdentity,
    processInstanceId: string,
    flowNodeId: string,
  ): Promise<TokenHistoryGroup> {

    const flowNodeInstances = await this.flowNodeInstanceRepository.queryFlowNodeInstancesByProcessInstanceId(processInstanceId, flowNodeId);

    const tokenHistories = this.createTokenHistories(flowNodeInstances);

    return tokenHistories;
  }

  // TODO: Add claim checks as soon as required claims have been defined.
  public async getTokensForCorrelationAndProcessModel(
    identity: IIdentity,
    correlationId: string,
    processModelId: string,
  ): Promise<TokenHistoryGroup> {

    const flowNodeInstances = await this.flowNodeInstanceRepository.queryByCorrelationAndProcessModel(correlationId, processModelId);

    const tokenHistories = this.createTokenHistories(flowNodeInstances);

    return tokenHistories;
  }

  // TODO: Add claim checks as soon as required claims have been defined.
  public async getTokensForProcessInstance(identity: IIdentity, processInstanceId: string): Promise<TokenHistoryGroup> {

    const flowNodeInstances = await this.flowNodeInstanceRepository.queryByProcessInstance(processInstanceId);

    const tokenHistories = this.createTokenHistories(flowNodeInstances);

    return tokenHistories;
  }

  private createTokenHistories(flowNodeInstances: Array<FlowNodeInstance>): TokenHistoryGroup {
    const tokenHistories: TokenHistoryGroup = {};

    flowNodeInstances.forEach((flowNodeInstance: FlowNodeInstance): void => {
      const tokenHistory = this.getTokenHistoryForFlowNode(flowNodeInstance);

      const flowNodeId = flowNodeInstance.flowNodeId;

      // eslint-disable-next-line no-null/no-null
      const flowNodeIdExist = tokenHistories[flowNodeId] !== null && tokenHistories[flowNodeId] !== undefined;

      if (flowNodeIdExist) {
        tokenHistories[flowNodeId].push(...tokenHistory);
      } else {
        tokenHistories[flowNodeId] = tokenHistory;
      }
    });

    return tokenHistories;
  }

  private getTokenHistoryForFlowNode(flowNodeInstance: FlowNodeInstance): Array<TokenHistoryEntry> {
    const tokenHistory = flowNodeInstance.tokens.map((fniToken: ProcessToken): TokenHistoryEntry => {

      const tokenHistoryEntry = new TokenHistoryEntry();
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
