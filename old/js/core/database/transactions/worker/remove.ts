
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { IWorker } from 'models/worker.model';

const remove = async (args: { humanId: string, workerId: string, roomId: string, towerId: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  try {
    let member = await Factories.MemberFactory.instance.find({ towerId: args.towerId, humanId: args.humanId }, session)
    if (member !== null) {
      let room = await Factories.RoomFactory.instance.find({ id: args.roomId, towerId: member.towerId }, session)
      if (room !== null) {
        let worker = await Factories.WorkerFactory.instance.find({ id: args.workerId }, session);
        if (worker !== null) {
          await Factories.WorkerFactory.instance.remove({ id: args.workerId }, session);
          let otherWorkersOfSameMachine = await Factories.WorkerFactory.instance.read({ machineId: worker.machineId, roomId: worker.roomId })
          if (!_session) {
            await session.commitTransaction();
            session.endSession();
          }
          return { success: true, worker, wasTheLast: otherWorkersOfSameMachine.length === 0 }
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

export default remove
