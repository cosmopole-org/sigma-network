
import mongoose, { ClientSession } from 'mongoose';
import { isEmpty } from '../../../utils/strings';
import PendingFactory from '../../factories/pending.factory';
import { makeUniqueId } from '../../../utils/generator';
import { IPending } from '../../../models/pending.model';

const signUp = async (args: { email: string }, _session?: ClientSession) => {
  if (isEmpty(args.email)) {
    console.error('email can not be empty');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let pending: IPending
  try {
    let success = false;
    pending = await PendingFactory.instance.find({ email: args.email }, session);
    let vCode = '123', cCode = makeUniqueId();
    if (pending === null) {
      pending = await PendingFactory.instance.create({
        email: args.email,
        cCode: cCode,
        vCode: vCode,
        progress: 'registered'
      }, session);
      if (!_session) await session.commitTransaction();
      success = true;
    } else {
      await PendingFactory.instance.update({ email: args.email }, { cCode, vCode, progress: 'registered' }, session);
      if (!_session) await session.commitTransaction();
      success = true;
    }
    if (!_session) session.endSession();
    if (success) {
      return { success: true, cCode };
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
}

export default signUp
