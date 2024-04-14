// Original file: packets.proto

import type { Long } from '@grpc/proto-loader';

export interface TowerDeleteDto {
  'towerId'?: (number | string | Long);
}

export interface TowerDeleteDto__Output {
  'towerId': (string);
}
