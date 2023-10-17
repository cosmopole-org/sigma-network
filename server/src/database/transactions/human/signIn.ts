
import { ClientSession } from 'mongoose';
import HumanFactory from '../../factories/human-factory';

const signIn = async ({ userId }, _session?: ClientSession) => {
  await HumanFactory.instance().update({ id: userId }, { lastSeen: -1 });
  return { success: true };
}

export default signIn
