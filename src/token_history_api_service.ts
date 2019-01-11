import {
  ITokenHistoryApi,
  TokenEventType,
  TokenHistoryEntry,
  TokenHistoryGroup,
} from '@process-engine/token_history_api_contracts';

import {IFlowNodeInstanceRepository, Runtime} from '@process-engine/process_engine_contracts';

import {IIAMService, IIdentity} from '@essential-projects/iam_contracts';

export class TokenHistoryApiService implements ITokenHistoryApi {

  private _iamService: IIAMService;
  private _flowNodeInstanceRepository: IFlowNodeInstanceRepository;

  constructor(iamService: IIAMService, flowNodeInstanceRepository: IFlowNodeInstanceRepository) {
    this._iamService = iamService;
    this._flowNodeInstanceRepository = flowNodeInstanceRepository;
  }

  private get iamService(): IIAMService {
    return this._iamService;
  }

  private get flowNodeInstanceRepository(): IFlowNodeInstanceRepository {
    return this._flowNodeInstanceRepository;
  }

  // TODO: Add claim checks as soon as required claims have been defined.
  public async getTokensForFlowNode(identity: IIdentity,
                                    correlationId: string,
                                    processModelId: string,
                                    flowNodeId: string): Promise<Array<TokenHistoryEntry>> {

    const flowNodeInstance: Runtime.Types.FlowNodeInstance =
      await this.flowNodeInstanceRepository.querySpecificFlowNode(correlationId, processModelId, flowNodeId);

    const tokenHistory: Array<TokenHistoryEntry> = flowNodeInstance.tokens.map((fniToken: Runtime.Types.ProcessToken): TokenHistoryEntry => {

      const tokenHistoryEntry: TokenHistoryEntry = new TokenHistoryEntry();
      tokenHistoryEntry.flowNodeId = flowNodeInstance.flowNodeId;
      tokenHistoryEntry.flowNodeInstanceId = flowNodeInstance.id;
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

  // TODO: Add claim checks as soon as required claims have been defined.
  public async getTokensForCorrelationAndProcessModel(identity: IIdentity,
                                                      correlationId: string,
                                                      processModelId: string): Promise<TokenHistoryGroup> {

    const flowNodeInstances: Array<Runtime.Types.FlowNodeInstance> =
      await this.flowNodeInstanceRepository.queryByCorrelationAndProcessModel(correlationId, processModelId);

    const tokenHistories: TokenHistoryGroup = {};

    flowNodeInstances.forEach((flowNodeInstance: Runtime.Types.FlowNodeInstance) => {

      const tokenHistoryEntries: Array<TokenHistoryEntry> =
        flowNodeInstance.tokens.map((fniToken: Runtime.Types.ProcessToken): TokenHistoryEntry => {

          const tokenHistoryEntry: TokenHistoryEntry = new TokenHistoryEntry();
          tokenHistoryEntry.flowNodeId = flowNodeInstance.flowNodeId;
          tokenHistoryEntry.flowNodeInstanceId = flowNodeInstance.id;
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

      const flowNodeId: string = flowNodeInstance.flowNodeId;
      tokenHistories[flowNodeId] = tokenHistoryEntries;
    });

    return tokenHistories;
  }

  // TODO: Add claim checks as soon as required claims have been defined.
  public async getTokensForProcessInstance(identity: IIdentity,
                                           processInstanceId: string): Promise<TokenHistoryGroup> {

    const flowNodeInstances: Array<Runtime.Types.FlowNodeInstance> =
      await this.flowNodeInstanceRepository.queryByProcessInstanceId(processInstanceId);

    const tokenHistories: TokenHistoryGroup = {};

    flowNodeInstances.forEach((flowNodeInstance: Runtime.Types.FlowNodeInstance) => {
      const tokenHistoryEntries: Array<TokenHistoryEntry> =
        flowNodeInstance.tokens.map((fniToken: Runtime.Types.ProcessToken): TokenHistoryEntry => {

          const tokenHistoryEntry: TokenHistoryEntry = new TokenHistoryEntry();
          tokenHistoryEntry.flowNodeId = flowNodeInstance.flowNodeId;
          tokenHistoryEntry.flowNodeInstanceId = flowNodeInstance.id;
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

      const flowNodeId: string = flowNodeInstance.flowNodeId;
      tokenHistories[flowNodeId] = tokenHistoryEntries;
    });

    return tokenHistories;
  }

}
