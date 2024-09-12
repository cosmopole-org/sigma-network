
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { makeUniqueId } from '../../../utils/generator';
import { isIdEmpty } from '../../../utils/numbers';
import { IInvite } from 'models/invite.model';
import { ITower } from 'models/tower.model';

const create = async (args: { towerId: string, targetHumanId: string, senderId: string }, _session?: ClientSession) => {
  if (isIdEmpty(args.towerId)) {
    console.error('tower id can not be empty');
    return { success: false };
  }
  if (isIdEmpty(args.targetHumanId)) {
    console.error('user id can not be empty');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let invite: IInvite, tower: ITower;
  try {
    let success = false;
    invite = await Factories.InviteFactory.instance.find({ humanId: args.targetHumanId, towerId: args.towerId }, session);
    if (invite === null) {
      tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session);
      if (tower.secret.adminIds.includes(args.senderId)) {
        let user = await Factories.HumanFactory.instance.find({ id: args.targetHumanId }, session);
        if (user !== null) {
          invite = await Factories.InviteFactory.instance.create({
            id: makeUniqueId(),
            humanId: args.targetHumanId,
            towerId: args.towerId,
          }, session);
          success = true;
          if (!_session) await session.commitTransaction();
        } else {
          console.error('user not found');
          if (!_session) {
            console.error('abort transaction');
            await session.abortTransaction();
          }
        }
      } else {
        console.error('user is not admin of the tower or room');
        if (!_session) {
          console.error('abort transaction');
          await session.abortTransaction();
        }
      }
    } else {
      console.error('invite already exists');
      if (!_session) {
        console.error('abort transaction');
        await session.abortTransaction();
      }
    }
    if (!_session) session.endSession();
    if (success) {
      return { success: true, invite: { ...invite, tower } }
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

export default create
