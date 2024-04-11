
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { IMachine } from 'models/machine.model';

const search = async (args: { query: string, offset?: number, count?: number }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let data: Array<IMachine>;
  try {
    if (args.offset === undefined && args.count === undefined) {
      data = await Factories.MachineFactory.instance.read(0, 100, {
        name: { '$regex': args.query, '$options': 'i' }
      });
    } else {
      data = await Factories.MachineFactory.instance.read(args.offset, args.count, {
        name: { '$regex': args.query, '$options': 'i' },
      });
    }
    if (!_session) {
      await session.commitTransaction();
      session.endSession();
    }
    return { success: true, machines: data };
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

export default search
