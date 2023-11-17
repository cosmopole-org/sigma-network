
import mongoose, { ClientSession } from 'mongoose';
import { isIdEmpty } from '../../../utils/numbers';
import permissions from '../../../permissions.json';
import { secureObject, secureAdmins } from '../../../utils/filter';
import { makeUniqueId } from '../../../utils/generator';
import { IMember } from 'models/member.model';
import { IHuman } from 'models/human.model';
import { IRoom } from 'models/room.model';
import { ITower } from 'models/tower.model';
import * as Factories from '../../factories'

const join = async (args: { towerId: string, requesterId: string }, _session?: ClientSession) => {
  if (isIdEmpty(args.towerId)) {
    console.error('tower id can not be empty');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let member: IMember, tower: ITower;
  try {
    tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session);
    if (tower.isPublic) {
      member = await Factories.MemberFactory.instance.find({ humanId: args.requesterId, towerId: args.towerId }, session);
      if (member === null) {
        member = await Factories.MemberFactory.instance.create({
          id: makeUniqueId(),
          humanId: args.requesterId,
          towerId: args.towerId,
          secret: {
            permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
          }
        }, session);
        if (!_session) {
          await session.commitTransaction();
          session.endSession();
        }
        return {
          success: true,
          member: member,
        };
      } else {
        console.log('you are already a member of this tower.')
        if (!_session) {
          console.error('abort transaction');
          await session.abortTransaction();
          session.endSession();
        }
        return { success: false };  
      }
    } else {
      if (!_session) {
        console.error('abort transaction');
        await session.abortTransaction();
        session.endSession();
      }
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

export default join
