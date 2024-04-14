// Original file: grpc/packets.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { HumanCompleteDto as _sigma_HumanCompleteDto, HumanCompleteDto__Output as _sigma_HumanCompleteDto__Output } from '../sigma/HumanCompleteDto';
import type { HumanCompleteOutput as _sigma_HumanCompleteOutput, HumanCompleteOutput__Output as _sigma_HumanCompleteOutput__Output } from '../sigma/HumanCompleteOutput';
import type { HumanGetDto as _sigma_HumanGetDto, HumanGetDto__Output as _sigma_HumanGetDto__Output } from '../sigma/HumanGetDto';
import type { HumanGetOutput as _sigma_HumanGetOutput, HumanGetOutput__Output as _sigma_HumanGetOutput__Output } from '../sigma/HumanGetOutput';
import type { HumanSignupDto as _sigma_HumanSignupDto, HumanSignupDto__Output as _sigma_HumanSignupDto__Output } from '../sigma/HumanSignupDto';
import type { HumanSignupOutput as _sigma_HumanSignupOutput, HumanSignupOutput__Output as _sigma_HumanSignupOutput__Output } from '../sigma/HumanSignupOutput';
import type { HumanUpdateDto as _sigma_HumanUpdateDto, HumanUpdateDto__Output as _sigma_HumanUpdateDto__Output } from '../sigma/HumanUpdateDto';
import type { HumanUpdateOutput as _sigma_HumanUpdateOutput, HumanUpdateOutput__Output as _sigma_HumanUpdateOutput__Output } from '../sigma/HumanUpdateOutput';
import type { HumanVerifyDto as _sigma_HumanVerifyDto, HumanVerifyDto__Output as _sigma_HumanVerifyDto__Output } from '../sigma/HumanVerifyDto';
import type { HumanVerifyOutput as _sigma_HumanVerifyOutput, HumanVerifyOutput__Output as _sigma_HumanVerifyOutput__Output } from '../sigma/HumanVerifyOutput';

export interface HumanServiceClient extends grpc.Client {
  complete(argument: _sigma_HumanCompleteDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanCompleteOutput__Output>): grpc.ClientUnaryCall;
  complete(argument: _sigma_HumanCompleteDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_HumanCompleteOutput__Output>): grpc.ClientUnaryCall;
  complete(argument: _sigma_HumanCompleteDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanCompleteOutput__Output>): grpc.ClientUnaryCall;
  complete(argument: _sigma_HumanCompleteDto, callback: grpc.requestCallback<_sigma_HumanCompleteOutput__Output>): grpc.ClientUnaryCall;
  complete(argument: _sigma_HumanCompleteDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanCompleteOutput__Output>): grpc.ClientUnaryCall;
  complete(argument: _sigma_HumanCompleteDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_HumanCompleteOutput__Output>): grpc.ClientUnaryCall;
  complete(argument: _sigma_HumanCompleteDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanCompleteOutput__Output>): grpc.ClientUnaryCall;
  complete(argument: _sigma_HumanCompleteDto, callback: grpc.requestCallback<_sigma_HumanCompleteOutput__Output>): grpc.ClientUnaryCall;
  
  get(argument: _sigma_HumanGetDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_HumanGetDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_HumanGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_HumanGetDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_HumanGetDto, callback: grpc.requestCallback<_sigma_HumanGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_HumanGetDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_HumanGetDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_HumanGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_HumanGetDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_HumanGetDto, callback: grpc.requestCallback<_sigma_HumanGetOutput__Output>): grpc.ClientUnaryCall;
  
  signup(argument: _sigma_HumanSignupDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanSignupOutput__Output>): grpc.ClientUnaryCall;
  signup(argument: _sigma_HumanSignupDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_HumanSignupOutput__Output>): grpc.ClientUnaryCall;
  signup(argument: _sigma_HumanSignupDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanSignupOutput__Output>): grpc.ClientUnaryCall;
  signup(argument: _sigma_HumanSignupDto, callback: grpc.requestCallback<_sigma_HumanSignupOutput__Output>): grpc.ClientUnaryCall;
  signup(argument: _sigma_HumanSignupDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanSignupOutput__Output>): grpc.ClientUnaryCall;
  signup(argument: _sigma_HumanSignupDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_HumanSignupOutput__Output>): grpc.ClientUnaryCall;
  signup(argument: _sigma_HumanSignupDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanSignupOutput__Output>): grpc.ClientUnaryCall;
  signup(argument: _sigma_HumanSignupDto, callback: grpc.requestCallback<_sigma_HumanSignupOutput__Output>): grpc.ClientUnaryCall;
  
  update(argument: _sigma_HumanUpdateDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_HumanUpdateDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_HumanUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_HumanUpdateDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_HumanUpdateDto, callback: grpc.requestCallback<_sigma_HumanUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_HumanUpdateDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_HumanUpdateDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_HumanUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_HumanUpdateDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_HumanUpdateDto, callback: grpc.requestCallback<_sigma_HumanUpdateOutput__Output>): grpc.ClientUnaryCall;
  
  verify(argument: _sigma_HumanVerifyDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanVerifyOutput__Output>): grpc.ClientUnaryCall;
  verify(argument: _sigma_HumanVerifyDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_HumanVerifyOutput__Output>): grpc.ClientUnaryCall;
  verify(argument: _sigma_HumanVerifyDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanVerifyOutput__Output>): grpc.ClientUnaryCall;
  verify(argument: _sigma_HumanVerifyDto, callback: grpc.requestCallback<_sigma_HumanVerifyOutput__Output>): grpc.ClientUnaryCall;
  verify(argument: _sigma_HumanVerifyDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanVerifyOutput__Output>): grpc.ClientUnaryCall;
  verify(argument: _sigma_HumanVerifyDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_HumanVerifyOutput__Output>): grpc.ClientUnaryCall;
  verify(argument: _sigma_HumanVerifyDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_HumanVerifyOutput__Output>): grpc.ClientUnaryCall;
  verify(argument: _sigma_HumanVerifyDto, callback: grpc.requestCallback<_sigma_HumanVerifyOutput__Output>): grpc.ClientUnaryCall;
  
}

export interface HumanServiceHandlers extends grpc.UntypedServiceImplementation {
  complete: grpc.handleUnaryCall<_sigma_HumanCompleteDto__Output, _sigma_HumanCompleteOutput>;
  
  get: grpc.handleUnaryCall<_sigma_HumanGetDto__Output, _sigma_HumanGetOutput>;
  
  signup: grpc.handleUnaryCall<_sigma_HumanSignupDto__Output, _sigma_HumanSignupOutput>;
  
  update: grpc.handleUnaryCall<_sigma_HumanUpdateDto__Output, _sigma_HumanUpdateOutput>;
  
  verify: grpc.handleUnaryCall<_sigma_HumanVerifyDto__Output, _sigma_HumanVerifyOutput>;
  
}

export interface HumanServiceDefinition extends grpc.ServiceDefinition {
  complete: MethodDefinition<_sigma_HumanCompleteDto, _sigma_HumanCompleteOutput, _sigma_HumanCompleteDto__Output, _sigma_HumanCompleteOutput__Output>
  get: MethodDefinition<_sigma_HumanGetDto, _sigma_HumanGetOutput, _sigma_HumanGetDto__Output, _sigma_HumanGetOutput__Output>
  signup: MethodDefinition<_sigma_HumanSignupDto, _sigma_HumanSignupOutput, _sigma_HumanSignupDto__Output, _sigma_HumanSignupOutput__Output>
  update: MethodDefinition<_sigma_HumanUpdateDto, _sigma_HumanUpdateOutput, _sigma_HumanUpdateDto__Output, _sigma_HumanUpdateOutput__Output>
  verify: MethodDefinition<_sigma_HumanVerifyDto, _sigma_HumanVerifyOutput, _sigma_HumanVerifyDto__Output, _sigma_HumanVerifyOutput__Output>
}
