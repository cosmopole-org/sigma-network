
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'

const readMembers = async (args: { towerId: string, humanId: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let result: Array<any>;
  try {
    let success = false
    let myMembership = await Factories.MemberFactory.instance.find({ towerId: args.towerId, humanId: args.humanId }, session)
    if (myMembership !== null) {
      let data = await Factories.MemberFactory.instance.findGroup({ towerId: args.towerId }, session);
      let humans = await Factories.HumanFactory.instance.findGroup({ id: { $in: data.map(m => m.humanId) } })
      let humansDict = {}
      humans.forEach(human => { humansDict[human.id] = human })
      result = data.map(m => ({ ...m, human: humansDict[m.humanId] }))
      success = true
    }
    if (!_session) {
      await session.commitTransaction();
      session.endSession();
    }
    if (success) {
      return { success: true, members: result };
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
