
import { ClientSession } from 'mongoose';
import * as Factories from '../../factories'

const signIn = async ({ userId }, _session?: ClientSession) => {
  await Factories.HumanFactory.instance.update({ id: userId }, { $set: { 'secret.lastSeen': -1 } });
  return { success: true };
}

export default signIn
