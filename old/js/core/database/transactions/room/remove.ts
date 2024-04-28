
import mongoose, { ClientSession } from 'mongoose'
import * as Factories from '../../factories'
import { IRoom } from 'models/room.model';

const remove = async (args: { towerId: string, roomId: string, humanId: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let room: IRoom
  try {
    let success = false;
    let tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      room = await Factories.RoomFactory.instance.find({ id: args.roomId, towerId: args.towerId }, session);
      if (tower.secret.adminIds.includes(args.humanId) || room.secret.adminIds.includes(args.humanId)) {
        await Factories.RoomFactory.instance.remove({ id: args.roomId }, session);
        success = true;
        if (!_session) await session.commitTransaction();
      } else {
        console.error('user is not admin of the tower or room');
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
      return { success: true, room };
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

export default remove
