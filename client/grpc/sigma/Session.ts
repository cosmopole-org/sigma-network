// Original file: grpc/packets.proto

import type { Long } from '@grpc/proto-loader';

export interface Session {
  'id'?: (number | string | Long);
  'userId'?: (number | string | Long);
  'creatureType'?: (number);
  'token'?: (string);
}

export interface Session__Output {
  'id': (string);
  'userId': (string);
  'creatureType': (number);
  'token': (string);
}
