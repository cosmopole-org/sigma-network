// Original file: grpc/packets.proto

import type { Pending as _sigma_Pending, Pending__Output as _sigma_Pending__Output } from '../sigma/Pending';
import type { Human as _sigma_Human, Human__Output as _sigma_Human__Output } from '../sigma/Human';
import type { Session as _sigma_Session, Session__Output as _sigma_Session__Output } from '../sigma/Session';

export interface HumanVerifyOutput {
  'pending'?: (_sigma_Pending | null);
  'human'?: (_sigma_Human | null);
  'session'?: (_sigma_Session | null);
}

export interface HumanVerifyOutput__Output {
  'pending': (_sigma_Pending__Output | null);
  'human': (_sigma_Human__Output | null);
  'session': (_sigma_Session__Output | null);
}
