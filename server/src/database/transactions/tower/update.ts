
import mongoose, { ClientSession } from 'mongoose';
import { isEmpty, isNameFieldInvalid } from '../../../utils/strings';
import * as Factories from '../../factories'

const update = async (args: { towerId: string, title: string, avatarId: string, isPublic: boolean, humanId: string }, _session?: ClientSession) => {
  if (isEmpty(args.title)) {
    console.error('title can not be empty');
    return { success: false };
  }
  if (isNameFieldInvalid(args.title)) {
    console.error('title can not be longer than limit');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  try {
    let success = false;
    let tower = await Factories.TowerFactory.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if (tower.secret.adminIds.includes(args.humanId)) {
        tower = await Factories.TowerFactory.instance.update({ id: tower.id }, {
          title: args.title,
          avatarId: isEmpty(args.avatarId) ? 'EMPTY' : args.avatarId,
          isPublic: args.isPublic
        }, session);
        success = true;
        if (!_session) await session.commitTransaction();
      } else {
        console.error('user is not admin of the tower');
        console.error('abort transaction');
        if (!_session) await session.abortTransaction();
      }
    } else {
      console.error('tower does not exist');
      console.error('abort transaction');
      if (!_session) await session.abortTransaction();
    }
    if (!_session) session.endSession();
    if (success) {
      return { success: true, tower };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error('abort transaction');
    if (!_session) {
      await session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
};

export default update
