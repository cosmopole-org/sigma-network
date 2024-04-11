
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { ITower } from 'models/tower.model';
import { IRoom } from 'models/room.model';

const read = async (args: { humanId: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let towers: Array<ITower>, rooms: Array<IRoom>;
  try {
    let members = await Factories.MemberFactory.instance.findGroup({ humanId: args.humanId }, session)
    towers = await Factories.TowerFactory.instance.findGroup({ id: { $in: members.map(m => m.towerId) } }, session);
    rooms = await Factories.RoomFactory.instance.findGroup({ towerId: { $in: towers.map(t => t.id) } }, session)
    if (!_session) {
      await session.commitTransaction();
      session.endSession();
    }
    return { success: true, towers, rooms };
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

export default read
