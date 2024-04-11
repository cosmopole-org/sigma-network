
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories';

const readById = async (args: { targetHumanId: string }, _session?: ClientSession) => {
  try {
    let human = await Factories.HumanFactory.instance.find({ id: args.targetHumanId });
    return { success: true, human };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export default readById
