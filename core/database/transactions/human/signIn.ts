
import { ClientSession } from 'mongoose';
import * as Factories from '../../factories'

const signIn = async (args: { humanId: string }, _session?: ClientSession) => {
  await Factories.HumanFactory.instance.update({ id: args.humanId }, { $set: { 'secret.lastSeen': -1 } });
  let memberships = await Factories.MemberFactory.instance.read({ humanId: args.humanId })
  return { success: true, memberships };
}

export default signIn
