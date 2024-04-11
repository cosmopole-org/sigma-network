
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

const addMember = async (args: { towerId: string, humanId: string }, _session?: ClientSession) => {
  if (isIdEmpty(args.towerId)) {
    console.error('tower id can not be empty');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let member: IMember, tower: ITower;
  try {
    tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session);
    member = await Factories.MemberFactory.instance.create({
      id: makeUniqueId(),
      humanId: args.humanId,
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

export default addMember
