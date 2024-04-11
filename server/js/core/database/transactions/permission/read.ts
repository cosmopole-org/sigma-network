
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'

const read = async (args: { towerId: string, targetHumanId: string, humanId: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  try {
    let success = false
    let permissions: { [id: string]: boolean } = {}
    let tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if ((tower.secret.ownerId === args.humanId) || (tower.secret.adminIds.includes(args.humanId) && !tower.secret.adminIds.includes(args.targetHumanId))) {
        let member = await Factories.MemberFactory.instance.find({ humanId: args.targetHumanId, towerId: args.towerId }, session);
        if (member !== null) {
          permissions = member.secret?.permissions ? member.secret.permissions : {};
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
    return { success: success };
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

export default read
