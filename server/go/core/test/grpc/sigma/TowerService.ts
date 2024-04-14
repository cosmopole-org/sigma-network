// Original file: packets.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { TowerCreateDto as _sigma_TowerCreateDto, TowerCreateDto__Output as _sigma_TowerCreateDto__Output } from '../sigma/TowerCreateDto';
import type { TowerCreateOutput as _sigma_TowerCreateOutput, TowerCreateOutput__Output as _sigma_TowerCreateOutput__Output } from '../sigma/TowerCreateOutput';
import type { TowerDeleteDto as _sigma_TowerDeleteDto, TowerDeleteDto__Output as _sigma_TowerDeleteDto__Output } from '../sigma/TowerDeleteDto';
import type { TowerDeleteOutput as _sigma_TowerDeleteOutput, TowerDeleteOutput__Output as _sigma_TowerDeleteOutput__Output } from '../sigma/TowerDeleteOutput';
import type { TowerGetDto as _sigma_TowerGetDto, TowerGetDto__Output as _sigma_TowerGetDto__Output } from '../sigma/TowerGetDto';
import type { TowerGetOutput as _sigma_TowerGetOutput, TowerGetOutput__Output as _sigma_TowerGetOutput__Output } from '../sigma/TowerGetOutput';
import type { TowerJoinDto as _sigma_TowerJoinDto, TowerJoinDto__Output as _sigma_TowerJoinDto__Output } from '../sigma/TowerJoinDto';
import type { TowerJoinOutput as _sigma_TowerJoinOutput, TowerJoinOutput__Output as _sigma_TowerJoinOutput__Output } from '../sigma/TowerJoinOutput';
import type { TowerUpdateDto as _sigma_TowerUpdateDto, TowerUpdateDto__Output as _sigma_TowerUpdateDto__Output } from '../sigma/TowerUpdateDto';
import type { TowerUpdateOutput as _sigma_TowerUpdateOutput, TowerUpdateOutput__Output as _sigma_TowerUpdateOutput__Output } from '../sigma/TowerUpdateOutput';

export interface TowerServiceClient extends grpc.Client {
  create(argument: _sigma_TowerCreateDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerCreateOutput__Output>): grpc.ClientUnaryCall;
  create(argument: _sigma_TowerCreateDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_TowerCreateOutput__Output>): grpc.ClientUnaryCall;
  create(argument: _sigma_TowerCreateDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerCreateOutput__Output>): grpc.ClientUnaryCall;
  create(argument: _sigma_TowerCreateDto, callback: grpc.requestCallback<_sigma_TowerCreateOutput__Output>): grpc.ClientUnaryCall;
  create(argument: _sigma_TowerCreateDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerCreateOutput__Output>): grpc.ClientUnaryCall;
  create(argument: _sigma_TowerCreateDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_TowerCreateOutput__Output>): grpc.ClientUnaryCall;
  create(argument: _sigma_TowerCreateDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerCreateOutput__Output>): grpc.ClientUnaryCall;
  create(argument: _sigma_TowerCreateDto, callback: grpc.requestCallback<_sigma_TowerCreateOutput__Output>): grpc.ClientUnaryCall;
  
  delete(argument: _sigma_TowerDeleteDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerDeleteOutput__Output>): grpc.ClientUnaryCall;
  delete(argument: _sigma_TowerDeleteDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_TowerDeleteOutput__Output>): grpc.ClientUnaryCall;
  delete(argument: _sigma_TowerDeleteDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerDeleteOutput__Output>): grpc.ClientUnaryCall;
  delete(argument: _sigma_TowerDeleteDto, callback: grpc.requestCallback<_sigma_TowerDeleteOutput__Output>): grpc.ClientUnaryCall;
  delete(argument: _sigma_TowerDeleteDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerDeleteOutput__Output>): grpc.ClientUnaryCall;
  delete(argument: _sigma_TowerDeleteDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_TowerDeleteOutput__Output>): grpc.ClientUnaryCall;
  delete(argument: _sigma_TowerDeleteDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerDeleteOutput__Output>): grpc.ClientUnaryCall;
  delete(argument: _sigma_TowerDeleteDto, callback: grpc.requestCallback<_sigma_TowerDeleteOutput__Output>): grpc.ClientUnaryCall;
  
  get(argument: _sigma_TowerGetDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_TowerGetDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_TowerGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_TowerGetDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_TowerGetDto, callback: grpc.requestCallback<_sigma_TowerGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_TowerGetDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_TowerGetDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_TowerGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_TowerGetDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerGetOutput__Output>): grpc.ClientUnaryCall;
  get(argument: _sigma_TowerGetDto, callback: grpc.requestCallback<_sigma_TowerGetOutput__Output>): grpc.ClientUnaryCall;
  
  join(argument: _sigma_TowerJoinDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerJoinOutput__Output>): grpc.ClientUnaryCall;
  join(argument: _sigma_TowerJoinDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_TowerJoinOutput__Output>): grpc.ClientUnaryCall;
  join(argument: _sigma_TowerJoinDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerJoinOutput__Output>): grpc.ClientUnaryCall;
  join(argument: _sigma_TowerJoinDto, callback: grpc.requestCallback<_sigma_TowerJoinOutput__Output>): grpc.ClientUnaryCall;
  join(argument: _sigma_TowerJoinDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerJoinOutput__Output>): grpc.ClientUnaryCall;
  join(argument: _sigma_TowerJoinDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_TowerJoinOutput__Output>): grpc.ClientUnaryCall;
  join(argument: _sigma_TowerJoinDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerJoinOutput__Output>): grpc.ClientUnaryCall;
  join(argument: _sigma_TowerJoinDto, callback: grpc.requestCallback<_sigma_TowerJoinOutput__Output>): grpc.ClientUnaryCall;
  
  update(argument: _sigma_TowerUpdateDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_TowerUpdateDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_TowerUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_TowerUpdateDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_TowerUpdateDto, callback: grpc.requestCallback<_sigma_TowerUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_TowerUpdateDto, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_TowerUpdateDto, metadata: grpc.Metadata, callback: grpc.requestCallback<_sigma_TowerUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_TowerUpdateDto, options: grpc.CallOptions, callback: grpc.requestCallback<_sigma_TowerUpdateOutput__Output>): grpc.ClientUnaryCall;
  update(argument: _sigma_TowerUpdateDto, callback: grpc.requestCallback<_sigma_TowerUpdateOutput__Output>): grpc.ClientUnaryCall;
  
}

export interface TowerServiceHandlers extends grpc.UntypedServiceImplementation {
  create: grpc.handleUnaryCall<_sigma_TowerCreateDto__Output, _sigma_TowerCreateOutput>;
  
  delete: grpc.handleUnaryCall<_sigma_TowerDeleteDto__Output, _sigma_TowerDeleteOutput>;
  
  get: grpc.handleUnaryCall<_sigma_TowerGetDto__Output, _sigma_TowerGetOutput>;
  
  join: grpc.handleUnaryCall<_sigma_TowerJoinDto__Output, _sigma_TowerJoinOutput>;
  
  update: grpc.handleUnaryCall<_sigma_TowerUpdateDto__Output, _sigma_TowerUpdateOutput>;
  
}

export interface TowerServiceDefinition extends grpc.ServiceDefinition {
  create: MethodDefinition<_sigma_TowerCreateDto, _sigma_TowerCreateOutput, _sigma_TowerCreateDto__Output, _sigma_TowerCreateOutput__Output>
  delete: MethodDefinition<_sigma_TowerDeleteDto, _sigma_TowerDeleteOutput, _sigma_TowerDeleteDto__Output, _sigma_TowerDeleteOutput__Output>
  get: MethodDefinition<_sigma_TowerGetDto, _sigma_TowerGetOutput, _sigma_TowerGetDto__Output, _sigma_TowerGetOutput__Output>
  join: MethodDefinition<_sigma_TowerJoinDto, _sigma_TowerJoinOutput, _sigma_TowerJoinDto__Output, _sigma_TowerJoinOutput__Output>
  update: MethodDefinition<_sigma_TowerUpdateDto, _sigma_TowerUpdateOutput, _sigma_TowerUpdateDto__Output, _sigma_TowerUpdateOutput__Output>
}
