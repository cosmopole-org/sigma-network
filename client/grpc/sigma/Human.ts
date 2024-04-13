// Original file: grpc/packets.proto

import type { Long } from '@grpc/proto-loader';

export interface Human {
  'id'?: (number | string | Long);
  'email'?: (string);
  'firstName'?: (string);
  'lastName'?: (string);
}

export interface Human__Output {
  'id': (string);
  'email': (string);
  'firstName': (string);
  'lastName': (string);
}
