// Original file: packets.proto

import type { Long } from '@grpc/proto-loader';

export interface Member {
  'id'?: (number | string | Long);
  'humanId'?: (number | string | Long);
  'towerId'?: (number | string | Long);
}

export interface Member__Output {
  'id': (string);
  'humanId': (string);
  'towerId': (string);
}
