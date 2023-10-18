
import mongoose, { ClientSession } from 'mongoose';
import { isEmpty, isNameFieldInvalid } from '../../../utils/strings';
import permissions from '../../../permissions.json';
import * as Factories from '../../factories'
import { makeUniqueId } from '../../../utils/generator';
import { IRoom } from 'src/models/room.model';
import { IMember } from 'src/models/member.model';

const create = async (args: { towerId: string, title: string, avatarId: string, isPublic: boolean, floor: string, humanId: string }, _session?: ClientSession) => {
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
  let room: IRoom, member: IMember, member2: IMember;
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
        member = await Factories.MemberFactory.instance.create({
          id: makeUniqueId(),
          humanId: args.humanId,
          towerId: tower.id,
          secret: {
            permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
          }
        }, session);
        if (tower.secret.isContact) {
          member2 = await Factories.MemberFactory.instance.create({
            id: makeUniqueId(),
            humanId: tower.secret.adminIds[0] === args.humanId ? tower.secret.adminIds[1] : tower.secret.adminIds[0],
            towerId: tower.id,
            secret: {
              permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
            }
          }, session);
        }
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
        success: true, room: room, member: member, member2: member2,
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
