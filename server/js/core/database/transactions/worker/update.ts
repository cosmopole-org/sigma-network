
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { IWorker } from 'models/worker.model';
import flat from 'flat'
import { Worker } from 'database/schema/worker.schema';

const update = async (args: { humanId: string, roomId: string, towerId: string, worker: IWorker }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  try {
    let member = await Factories.MemberFactory.instance.find({ towerId: args.towerId, humanId: args.humanId }, session)
    if (member !== null) {
      let room = await Factories.RoomFactory.instance.find({ id: args.roomId, towerId: member.towerId }, session)
      if (room !== null) {
        let worker = await Factories.WorkerFactory.instance.find({ id: args.worker.id }, session)
        if (worker !== null) {
          worker = await Factories.WorkerFactory.instance.update({ id: args.worker.id }, args.worker, session);
          if (!_session) {
            await session.commitTransaction();
            session.endSession();
          }
          return { success: true, worker }
        } else {
          if (!_session) {
            await session.abortTransaction();
            session.endSession();
          }
          return { success: false }
        }
      } else {
        if (!_session) {
          await session.abortTransaction();
          session.endSession();
        }
        return { success: false }
      }
    } else {
      if (!_session) {
        await session.abortTransaction();
        session.endSession();
      }
      return { success: false }
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

export default update
