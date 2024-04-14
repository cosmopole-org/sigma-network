// Original file: packets.proto

import type { Long } from '@grpc/proto-loader';

export interface TowerUpdateDto {
  'towerId'?: (number | string | Long);
  'name'?: (string);
  'avatarId'?: (number | string | Long);
  'isPublic'?: (boolean);
}

export interface TowerUpdateDto__Output {
  'towerId': (string);
  'name': (string);
  'avatarId': (string);
  'isPublic': (boolean);
}
