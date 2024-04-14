// Original file: grpc/packets.proto

import type { Long } from '@grpc/proto-loader';

export interface Pending {
  'id'?: (number | string | Long);
  'email'?: (string);
  'verifyCode'?: (string);
  'clientCode'?: (string);
  'state'?: (string);
}

export interface Pending__Output {
  'id': (string);
  'email': (string);
  'verifyCode': (string);
  'clientCode': (string);
  'state': (string);
}
