
import HumanFactory from '../../factories/human-factory';

const signIn = async ({ }, userId: string) => {
  await HumanFactory.instance().update({ id: userId }, { lastSeen: -1 });
  return { success: true };
}

export default signIn
