
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { isIdEmpty } from '../../../utils/numbers';

const cancel = async (args: { inviteId: string, humanId: string, towerId: string }, _session?: ClientSession) => {
  if (isIdEmpty(args.inviteId)) {
    console.error('invite id can not be empty');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let targetHumanId: string;
  try {
    let success = false;
    let invite = await Factories.InviteFactory.instance.find({ id: args.inviteId, towerId: args.towerId }, session);
    if (invite !== null) {
      targetHumanId = invite.humanId
      let tower = await Factories.TowerFactory.instance.find({ id: invite.towerId }, session);
      if (tower.secret.adminIds.includes(args.humanId)) {
        await Factories.InviteFactory.instance.remove({ id: invite.id }, session);
        success = true;
        if (!_session) await session.commitTransaction();
      } else {
        console.error('access denied');
        if (!_session) {
          console.error('abort transaction');
          await session.abortTransaction();
        }
      }
    } else {
      console.error('invite not found');
      if (!_session) {
        console.error('abort transaction');
        await session.abortTransaction();
      }
    }
    if (!_session) session.endSession();
    if (success) {
      if (targetHumanId) {
        return { success: true, targetHumanId }
      } else {
        return { success: true }
      }
    } else {
      return { success: false }
    }
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

export default cancel
