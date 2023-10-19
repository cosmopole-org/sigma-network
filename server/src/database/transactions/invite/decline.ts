
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { isIdEmpty } from '../../../utils/numbers';

const decline = async (args: { inviteId: string, humanId: string }, _session?: ClientSession) => {
  if (isIdEmpty(args.inviteId)) {
    console.error('invite id can not be empty');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  try {
    let success = false;
    let invite = await Factories.InviteFactory.instance.find({ id: args.inviteId, humanId: args.humanId }, session);
    if (invite !== null) {
      await Factories.InviteFactory.instance.remove({ id: invite.id }, session);
      success = true;
      if (!_session) await session.commitTransaction();
    } else {
      console.error('invite not found');
      if (!_session) {
        console.error('abort transaction');
        await session.abortTransaction();
      }
    }
    if (!_session) session.endSession();
    return { success };
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error('abort transaction');
      await session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
}

export default decline
