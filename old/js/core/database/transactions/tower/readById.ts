
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { ITower } from 'models/tower.model';
import { IRoom } from 'models/room.model';

const readById = async (args: { towerId: string, humanId?: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let tower: ITower, rooms: Array<IRoom>;
  try {
    let success = false
    tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if (tower.isPublic) {
        success = true
      } else {
        if (args.humanId) {
          let member = await Factories.MemberFactory.instance.find({ humanId: args.humanId, towerId: args.towerId }, session)
          success = (member !== null)
        }
      }
    }
    if (success) {
      rooms = await Factories.RoomFactory.instance.findGroup({ towerId: tower.id }, session)
    }
    if (!_session) {
      await session.commitTransaction();
      session.endSession();
    }
    if (success) {
      return { success: true, tower, rooms };
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
}

export default readById
