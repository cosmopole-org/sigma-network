// Original file: packets.proto

import type { Tower as _sigma_Tower, Tower__Output as _sigma_Tower__Output } from '../sigma/Tower';
import type { Member as _sigma_Member, Member__Output as _sigma_Member__Output } from '../sigma/Member';

export interface TowerCreateOutput {
  'tower'?: (_sigma_Tower | null);
  'member'?: (_sigma_Member | null);
}

export interface TowerCreateOutput__Output {
  'tower': (_sigma_Tower__Output | null);
  'member': (_sigma_Member__Output | null);
}
