
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories';

const readGroupById = async (args: { targetHumanIds: Array<string> }, _session?: ClientSession) => {
  try {
    let humans = await Factories.HumanFactory.instance.findGroup({ id: { $in: args.targetHumanIds } });
    return { success: true, humans };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export default readGroupById
