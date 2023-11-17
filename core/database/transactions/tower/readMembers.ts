
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { IMember } from 'models/member.model';

const readMembers = async (args: { towerId: string, humanId: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let data: Array<IMember>;
  try {
    let success = false
    let myMembership = await Factories.MemberFactory.instance.find({ towerId: args.towerId, humanId: args.humanId }, session)
    if (myMembership !== null) {
      data = await Factories.MemberFactory.instance.findGroup({ towerId: args.towerId }, session);
      success = true
    }
    if (!_session) {
      await session.commitTransaction();
      session.endSession();
    }
    if (success) {
      return { success: true, members: data };
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

export default readMembers
