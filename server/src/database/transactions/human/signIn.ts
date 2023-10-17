
import { ClientSession } from 'mongoose';
import * as Factories from '../../factories'

const signIn = async ({ humanId }, _session?: ClientSession) => {
  await Factories.HumanFactory.instance.update({ id: humanId }, { $set: { 'secret.lastSeen': -1 } });
  return { success: true };
}

export default signIn
