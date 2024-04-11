
import mongoose, { ClientSession } from 'mongoose';
import { isEmpty, isNameFieldInvalid } from '../../../utils/strings';
import { IRoom } from 'models/room.model';
import * as Factories from '../../factories'

const update = async (args: { towerId: string, roomId: string, title: string, avatarId: string, isPublic: string, humanId: string }, _session?: ClientSession) => {
  if (isEmpty(args.title)) {
    console.error('title can not be empty');
    return { success: false };
  }
  if (isNameFieldInvalid(args.title)) {
    console.error('title can not be longer than limit');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let room: IRoom
  try {
    let success = false;
    let tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      room = await Factories.RoomFactory.instance.find({ id: args.roomId, towerId: args.towerId }, session);
      if (tower.secret.adminIds.includes(args.humanId) || room.secret.adminIds.includes(args.humanId)) {
        await Factories.RoomFactory.instance.update({ id: args.roomId }, {
          title: args.title,
          avatarId: isEmpty(args.avatarId) ? 'EMPTY' : args.avatarId,
          isPublic: args.isPublic,
        }, session);
        room = await Factories.RoomFactory.instance.find({ id: args.roomId, towerId: args.towerId }, session);
        success = true;
        if (!_session) await session.commitTransaction();
      } else {
        console.error('user is not admin of the tower or room');
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
    if (success) {
      return { success: true, room };
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
};

export default update
