
import mongoose, { ClientSession } from 'mongoose';
import { isEmpty, isNameFieldInvalid } from '../../../utils/strings';
import permissions from '../../../permissions.json';
import * as Factories from '../../factories'
import { makeUniqueId } from '../../../utils/generator';
import { IMachine } from 'models/machine.model';
import { IWorker } from 'models/worker.model';

const create = async (args: { humanId: string, machineId: string, roomId: string, towerId: string, secret: any }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let worker: IWorker;
  try {
    console.log('hello')
    let member = await Factories.MemberFactory.instance.find({ towerId: args.towerId, humanId: args.humanId }, session)
    console.log('member', member)
    if (member !== null) {
      let room = await Factories.RoomFactory.instance.find({ id: args.roomId, towerId: member.towerId }, session)
      console.log('room', room)
      if (room !== null) {
        worker = await Factories.WorkerFactory.instance.create({
          id: makeUniqueId(),
          machineId: args.machineId,
          roomId: args.roomId,
          secret: args.secret
        }, session);
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
