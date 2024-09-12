
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { makeUniqueId } from '../../../utils/generator';
import { isIdEmpty } from '../../../utils/numbers';
import { IMember } from 'models/member.model';
import { IRoom } from 'models/room.model';
import { ITower } from 'models/tower.model';
import permissions from '../../../permissions.json';

const accept = async (args: { inviteId: string, humanId: string, towerId: string }, _session?: ClientSession) => {
  if (isIdEmpty(args.inviteId)) {
    console.error('invite id can not be empty');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let member: IMember, room: IRoom, tower: ITower, rooms: Array<IRoom>
  try {
    let invite = await Factories.InviteFactory.instance.find({ id: args.inviteId, humanId: args.humanId, towerId: args.towerId }, session);
    if (invite !== null) {
      await Promise.all([
        (async () => { tower = await Factories.TowerFactory.instance.find({ id: invite.towerId }, session); })(),
        (async () => {
          member = await Factories.MemberFactory.instance.create({
            id: makeUniqueId(),
            humanId: invite.humanId,
            towerId: invite.towerId,
            secret: {
              permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
            }
          }, session);
        })(),
        (async () => { await Factories.InviteFactory.instance.remove({ id: invite.id }, session); })(),
        (async () => { rooms = await Factories.RoomFactory.instance.findGroup({ towerId: invite.towerId }, session); })()
      ])
      if (!_session) {
        await session.commitTransaction();
        session.endSession();
      }
      return {
        success: true,
        member: member,
        rooms: rooms,
        tower,
        room,
      }
    } else {
      console.error('invite not found');
      if (!_session) {
        console.error('abort transaction');
        await session.abortTransaction();
        session.endSession();
      }
      return { success: false }
    }
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error('abort transaction');
      await session.abortTransaction();
      session.endSession();
    }
    return { success: false }
  }
}

export default accept
