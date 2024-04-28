
import mongoose, { ClientSession } from 'mongoose';
import { isEmpty, isNameFieldInvalid } from '../../../utils/strings';
import permissions from '../../../permissions.json';
import * as Factories from '../../factories'
import { makeUniqueId } from '../../../utils/generator';
import { ITower } from 'models/tower.model';
import { IRoom } from 'models/room.model';
import { IMember } from 'models/member.model';

const create = async (args: { title: string, avatarId: string, isPublic: boolean, ownerId: string, creationCallback?: any }, _session?: ClientSession) => {
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
  let tower: ITower, room: IRoom, member: IMember;
  try {
    tower = await Factories.TowerFactory.instance.create({
      id: makeUniqueId(),
      title: args.title,
      avatarId: isEmpty(args.avatarId) ? 'EMPTY' : args.avatarId,
      isPublic: args.isPublic,
      secret: {
        ownerId: args.ownerId,
        adminIds: [
          args.ownerId
        ]
      }
    }, session);
    room = await Factories.RoomFactory.instance.create({
      id: makeUniqueId(),
      title: 'hall',
      avatarId: 'EMPTY',
      floor: 'hall',
      isPublic: args.isPublic,
      towerId: tower.id,
      secret: {
        adminIds: [
          args.ownerId
        ]
      }
    }, session)
    args.creationCallback && await args.creationCallback(room, session)
    member = await Factories.MemberFactory.instance.create({
      id: makeUniqueId(),
      humanId: args.ownerId,
      towerId: tower.id,
      secret: {
        permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
      }
    }, session);
    if (!_session) {
      await session.commitTransaction();
      session.endSession();
    }
    return { success: true, tower, room, member };
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

export default create
