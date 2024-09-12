
import mongoose, { ClientSession } from 'mongoose';
import { isEmpty, isNameFieldInvalid } from '../../../utils/strings';
import * as Factories from '../../factories'

const update = async (args: { machineId: string, name: string, humanId: string }, _session?: ClientSession) => {
  if (isEmpty(args.name)) {
    console.error('title can not be empty');
    return { success: false };
  }
  if (isNameFieldInvalid(args.name)) {
    console.error('title can not be longer than limit');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  try {
    let success = false;
    let machine = await Factories.MachineFactory.instance.find({ id: args.machineId }, session);
    if (machine !== null) {
      if (machine.secret.creatorId === args.humanId) {
        machine = await Factories.MachineFactory.instance.update({ id: machine.id }, {
          name: args.name,
        }, session);
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
      return { success: true, machine };
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

export default update
