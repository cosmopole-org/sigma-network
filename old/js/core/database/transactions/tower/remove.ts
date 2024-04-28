
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories';
import * as Schemas from '../../schema';

const remove = async (args: { towerId: string, humanId: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  try {
    let memberIds: Array<string>
    let success = false;
    let tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if (tower.secret.adminIds.includes(args.humanId)) {
        memberIds = (await Factories.MemberFactory.instance.findGroup({ towerId: args.towerId }, session)).map(m => m.humanId)
        await Factories.TowerFactory.instance.remove({ id: tower.id }, session);
        success = true;
        if (!_session) await session.commitTransaction();
      } else {
        console.error('user is not admin of the tower');
        console.error('abort transaction');
        if (!_session) await session.abortTransaction();
      }
    } else {
      console.error('tower does not exist');
      console.error('abort transaction');
      if (!_session) await session.abortTransaction();
    }
    if (!_session) session.endSession();
    if (success) {
      return { success: true, tower, memberIds };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error('abort transaction');
    if (!_session) {
      await session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
};

export default remove
