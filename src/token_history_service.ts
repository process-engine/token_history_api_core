import {ITokenHistoryService, TokenHistoryEntry} from '@process-engine/token_history_api_contracts';

import {IFlowNodeInstanceRepository, Runtime} from '@process-engine/process_engine_contracts';

import {IIAMService, IIdentity} from '@essential-projects/iam_contracts';

export class TokenHistoryService implements ITokenHistoryService {

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
  public async getTokensForFlowNodeInstance(identity: IIdentity, flowNodeInstanceId: string): Promise<Array<TokenHistoryEntry>> {

    // TODO: Implement method in FlowNodeInstanceRepository.
    // const matchingInstances: any =
    //   await this.flowNodeInstanceRepository.queryByFlowNodeInstanceId(flowNodeInstanceId, Runtime.Types.FlowNodeInstanceState.finished);

    return Promise.resolve([]);
  }
}
