
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { ITower } from 'models/tower.model';

const readById = async (args: { towerId: string, roomId: string, humanId: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let success = false;
  try {
    let room = await Factories.RoomFactory.instance.find({ id: args.roomId, towerId: args.towerId }, session);
    if (room !== null) {
      if (room.isPublic) {
        success = true;
      } else {
        let member = await Factories.MemberFactory.instance.find({ humanId: args.humanId, roomId: args.roomId }, session);
        if (member !== null) {
          success = true;
        } else {
          let invite = await Factories.InviteFactory.instance.find({ humanId: args.humanId, roomId: args.roomId }, session);
          if (invite !== null) {
            success = true;
          }
        }
      }
    }
    let tower: ITower;
    if (success) {
      tower = await Factories.TowerFactory.instance.find({ id: room.towerId }, session);
    }
    if (!_session) {
      await session.commitTransaction();
      session.endSession();
    }
    if (success) {
      return { success: true, tower, room };
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

export default readById
