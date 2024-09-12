
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { IMember } from 'models/member.model';

const update = async (args: { towerId: string, permissions: { [id: string]: boolean }, targetHumanId: string, humanId: string }, _session?: ClientSession) => {
  if (args.permissions === undefined) {
    console.error('permissions can not be empty');
    return { success: false };
  }
  if (args.targetHumanId === args.humanId) {
    console.error('access denied');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let member: IMember;
  try {
    let success = false;
    let tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if ((tower.secret.ownerId === args.humanId) || (tower.secret.adminIds.includes(args.humanId) && !tower.secret.adminIds.includes(args.targetHumanId))) {
        let member = await Factories.MemberFactory.instance.update({ humanId: args.targetHumanId, towerId: args.towerId }, {
          secret: {
            permissions: args.permissions
          }
        }, session);
        if (member !== null) {
          if (!_session) await session.commitTransaction();
          success = true;
        } else {
          console.error('access denied');
          if (!_session) {
            console.error('abort transaction');
            await session.abortTransaction();
          }
        }
      } else {
        console.error('access denied');
        if (!_session) {
          console.error('abort transaction');
          await session.abortTransaction();
        }
      }
    } else {
      console.error('tower does not exist');
      if (!_session) {
        console.error('abort transaction');
        await session.abortTransaction();
      }
    }
    if (!_session) session.endSession();
    return { success }
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

export default update
