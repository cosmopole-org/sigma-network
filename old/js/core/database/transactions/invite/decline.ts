
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { isIdEmpty } from '../../../utils/numbers';
import { ITower } from 'models/tower.model';

const decline = async (args: { inviteId: string, humanId: string, towerId: string }, _session?: ClientSession) => {
  if (isIdEmpty(args.inviteId)) {
    console.error('invite id can not be empty');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let tower: ITower
  try {
    let success = false;
    let invite = await Factories.InviteFactory.instance.find({ id: args.inviteId, humanId: args.humanId, towerId: args.towerId }, session);
    if (invite !== null) {
      tower = await Factories.TowerFactory.instance.find({ id: invite.towerId }, session)
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
    if (success) {
      return { success: true, adminIds: tower.secret.adminIds };
    } else {
      return { success: false };
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

export default decline
