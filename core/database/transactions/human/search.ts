
import mongoose, { ClientSession } from 'mongoose';
import { secureObject } from '../../../utils/filter';
import * as Factories from '../../factories';

const search = async (args: { query: string, offset?: number, count?: number }, _session?: ClientSession) => {
  try {
    let data = await Factories.HumanFactory.instance.read(args.offset, args.count, {
      $or: [
        { firstName: { '$regex': args.query, '$options': 'i' } },
        { lastName: { '$regex': args.query, '$options': 'i' } }
      ],
    });
    return { success: true, humans: data };
  } catch (error) {
    return { success: false };
  }
}

export default search
