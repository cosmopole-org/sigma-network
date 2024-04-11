
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { IWorker } from 'models/worker.model';

const read = async (args: { towerId: string, roomId: string, humanId?: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let data: Array<IWorker>, success = false
  try {
    let tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session)
    if (tower !== null) {
      let room = await Factories.RoomFactory.instance.find({ id: args.roomId, towerId: tower.id }, session)
      if (room !== null) {
        if (tower.isPublic) {
          data = await Factories.WorkerFactory.instance.read({ roomId: room.id })
          success = true
        } else {
          let member = await Factories.MemberFactory.instance.find({ towerId: tower.id, humanId: args.humanId }, session)
          if (member !== null) {
            data = await Factories.WorkerFactory.instance.read({ roomId: room.id })
            success = true
          }
        }
      }
    }
    if (!_session) {
      await session.commitTransaction();
      session.endSession();
    }
    return { success: true, workers: data };
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
