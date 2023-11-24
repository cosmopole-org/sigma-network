
import mongoose, { ClientSession } from 'mongoose';
import { isEmpty, isNameFieldInvalid } from '../../../utils/strings';
import permissions from '../../../permissions.json';
import * as Factories from '../../factories'
import { makeUniqueId } from '../../../utils/generator';
import { IRoom } from 'models/room.model';
import { IMember } from 'models/member.model';

const create = async (args: { towerId: string, title: string, avatarId: string, isPublic: boolean, floor: string, humanId: string, creationCallback?: any }, _session?: ClientSession) => {
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
  let room: IRoom;
  try {
    let success = false;
    let tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if (tower.secret.adminIds.includes(args.humanId)) {
        room = await Factories.RoomFactory.instance.create({
          id: makeUniqueId(),
          title: args.title,
          avatarId: isEmpty(args.avatarId) ? 'EMPTY' : args.avatarId,
          towerId: args.towerId,
          isPublic: args.isPublic,
          floor: args.floor,
          secret: {
            adminIds: [
              args.humanId
            ]
          }
        }, session);
        args.creationCallback && await args.creationCallback(room, session)
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
      return {
        success: true, room
      };
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

export default create
