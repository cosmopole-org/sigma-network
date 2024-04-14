// Original file: packets.proto

import type { Long } from '@grpc/proto-loader';

export interface Tower {
  'id'?: (number | string | Long);
  'name'?: (string);
  'avatarId'?: (number | string | Long);
  'isPublic'?: (boolean);
  'creatorId'?: (number | string | Long);
}

export interface Tower__Output {
  'id': (string);
  'name': (string);
  'avatarId': (string);
  'isPublic': (boolean);
  'creatorId': (string);
}
