
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'

const signOut = async (args: { humanId: string }, _session?: ClientSession) => {
  try {
    await Factories.HumanFactory.instance.update({ id: args.humanId }, { $set: { 'secret.lastSeen': Date.now() } });
    let memberships = await Factories.MemberFactory.instance.read({ humanId: args.humanId })
    return { success: true, memberships };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export default signOut
