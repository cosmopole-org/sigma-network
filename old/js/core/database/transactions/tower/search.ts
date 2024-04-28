
import mongoose, { ClientSession } from 'mongoose';
import { isReadCountEmpty, isReadCountInvalid, isIdEmpty } from '../../../utils/numbers';
import * as Factories from '../../factories'
import { ITower } from 'models/tower.model';

const search = async (args: { query: string, offset?: number, count?: number, mine?: boolean, humanId?: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let data: Array<ITower>;
  try {
    if (args.mine) {
      let members = await Factories.MemberFactory.instance.findGroup({ userId: args.humanId }, session);
      if (args.offset === undefined && args.count === undefined) {
        data = await Factories.TowerFactory.instance.read(0, 100, {
          $or: [
            { title: { '$regex': args.query, '$options': 'i' }, id: { $in: members.map(m => m.towerId) } },
            { description: { '$regex': args.query, '$options': 'i' }, id: { $in: members.map(m => m.towerId) } }
          ]
        });
      } else {
        data = await Factories.TowerFactory.instance.read(args.offset, args.count, {
          $or: [
            { title: { '$regex': args.query, '$options': 'i' }, id: { $in: members.map(m => m.towerId) } },
            { description: { '$regex': args.query, '$options': 'i' }, id: { $in: members.map(m => m.towerId) } }
          ]
        });
      }
    } else {
      if (args.offset === undefined && args.count === undefined) {
        data = await Factories.TowerFactory.instance.read(0, 100, {
          isPublic: true,
          $or: [
            { title: { '$regex': args.query, '$options': 'i' } },
            { description: { '$regex': args.query, '$options': 'i' } }
          ]
        });
      } else {
        data = await Factories.TowerFactory.instance.read(args.offset, args.count, {
          isPublic: true,
          $or: [
            { title: { '$regex': args.query, '$options': 'i' } },
            { description: { '$regex': args.query, '$options': 'i' } }
          ]
        });
      }
    }
    if (!_session) {
      await session.commitTransaction();
      session.endSession();
    }
    return { success: true, towers: data };
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

export default search
