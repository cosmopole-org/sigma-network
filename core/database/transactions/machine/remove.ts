
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories';
import * as Schemas from '../../schema';

const remove = async (args: { machineId: string, humanId: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  try {
    let memberIds: Array<string>
    let success = false;
    let machine = await Factories.MachineFactory.instance.find({ id: args.machineId }, session);
    if (machine !== null) {
      if (machine.secret.creatorId === args.humanId) {
        await Factories.MachineFactory.instance.remove({ id: machine.id }, session);
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

export default remove
