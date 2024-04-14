import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { HumanServiceClient as _sigma_HumanServiceClient, HumanServiceDefinition as _sigma_HumanServiceDefinition } from './sigma/HumanService';

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
    Pending: MessageTypeDefinition
    Session: MessageTypeDefinition
  }
}

