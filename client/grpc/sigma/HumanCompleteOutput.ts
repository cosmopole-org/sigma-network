// Original file: grpc/packets.proto

import type { Human as _sigma_Human, Human__Output as _sigma_Human__Output } from '../sigma/Human';
import type { Session as _sigma_Session, Session__Output as _sigma_Session__Output } from '../sigma/Session';

export interface HumanCompleteOutput {
  'human'?: (_sigma_Human | null);
  'session'?: (_sigma_Session | null);
}

export interface HumanCompleteOutput__Output {
  'human': (_sigma_Human__Output | null);
  'session': (_sigma_Session__Output | null);
}
