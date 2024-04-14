// Original file: packets.proto

import type { Long } from '@grpc/proto-loader';

export interface TowerCreateDto {
  'name'?: (string);
  'avatarId'?: (number | string | Long);
  'isPublic'?: (boolean);
}

export interface TowerCreateDto__Output {
  'name': (string);
  'avatarId': (string);
  'isPublic': (boolean);
}
