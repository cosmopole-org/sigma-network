
import mongoose, { ClientSession } from 'mongoose'
import * as Factories from '../../factories'
import { isReadCountEmpty, isReadCountInvalid } from '../../../utils/numbers'

const search = async (args: { query: string, offset?: number, count?: number, towerId: string, humanId: string }, _session?: ClientSession) => {
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let data;
  try {
    let success = false;
    let tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if (tower.isPublic !== true) {
        let member = await Factories.MemberFactory.instance.find({ humanId: args.humanId, towerId: args.towerId }, session)
        if (member !== null) {
          if (args.offset && args.count) {
            data = await Factories.RoomFactory.instance.read(args.offset, args.count, {
              towerId: args.towerId,
              $or: [
                {
                  title: { '$regex': args.query, '$options': 'i' },
                },
                {
                  description: { '$regex': args.query, '$options': 'i' },
                }
              ]
            })
          } else {
            data = await Factories.RoomFactory.instance.read(0, 100, {
              towerId: args.towerId,
              $or: [
                {
                  title: { '$regex': args.query, '$options': 'i' },
                },
                {
                  description: { '$regex': args.query, '$options': 'i' },
                }
              ]
            })
          }
          success = true
        } else {
          console.error('access denied');
          if (!_session) {
            console.error('abort transaction');
            await session.abortTransaction();
          }
        }
      } else {
        if (args.offset && args.count) {
          data = await Factories.RoomFactory.instance.read(args.offset, args.count, {
            towerId: args.towerId,
            $or: [
              {
                title: { '$regex': args.query, '$options': 'i' },
              },
              {
                description: { '$regex': args.query, '$options': 'i' },
              }
            ]
          })
        } else {
          data = await Factories.RoomFactory.instance.read(0, 100, {
            towerId: args.towerId,
            $or: [
              {
                title: { '$regex': args.query, '$options': 'i' },
              },
              {
                description: { '$regex': args.query, '$options': 'i' },
              }
            ]
          })
        }
        if (!_session) await session.commitTransaction();
        success = true;
      }
    } else {
      console.error('tower does not exist');
      if (!_session) {
        console.error('abort transaction');
        await session.abortTransaction();
      }
    }
    if (!_session) session.endSession();
    if (success) {
      return { success: true, rooms: data, tower };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error('abort transaction');
      await session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
}

export default search
