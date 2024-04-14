import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { HumanServiceClient as _sigma_HumanServiceClient, HumanServiceDefinition as _sigma_HumanServiceDefinition } from './sigma/HumanService';
import type { TowerServiceClient as _sigma_TowerServiceClient, TowerServiceDefinition as _sigma_TowerServiceDefinition } from './sigma/TowerService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = new(...args: ConstructorParameters<Constructor>) => Subtype;

export interface ProtoGrpcType {
  sigma: {
    Human: MessageTypeDefinition
    HumanCompleteDto: MessageTypeDefinition
    HumanCompleteOutput: MessageTypeDefinition
    HumanGetDto: MessageTypeDefinition
    HumanGetOutput: MessageTypeDefinition
    HumanService: SubtypeConstructor<typeof grpc.Client, _sigma_HumanServiceClient> & { service: _sigma_HumanServiceDefinition }
    HumanSignupDto: MessageTypeDefinition
    HumanSignupOutput: MessageTypeDefinition
    HumanUpdateDto: MessageTypeDefinition
    HumanUpdateOutput: MessageTypeDefinition
    HumanVerifyDto: MessageTypeDefinition
    HumanVerifyOutput: MessageTypeDefinition
    Member: MessageTypeDefinition
    Pending: MessageTypeDefinition
    Session: MessageTypeDefinition
    Tower: MessageTypeDefinition
    TowerCreateDto: MessageTypeDefinition
    TowerCreateOutput: MessageTypeDefinition
    TowerDeleteDto: MessageTypeDefinition
    TowerDeleteOutput: MessageTypeDefinition
    TowerGetDto: MessageTypeDefinition
    TowerGetOutput: MessageTypeDefinition
    TowerJoinDto: MessageTypeDefinition
    TowerJoinOutput: MessageTypeDefinition
    TowerService: SubtypeConstructor<typeof grpc.Client, _sigma_TowerServiceClient> & { service: _sigma_TowerServiceDefinition }
    TowerUpdateDto: MessageTypeDefinition
    TowerUpdateOutput: MessageTypeDefinition
  }
}

