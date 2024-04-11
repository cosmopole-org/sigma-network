
import mongoose, { ClientSession } from 'mongoose';
import { isEmpty, isNameFieldInvalid } from '../../../utils/strings';
import permissions from '../../../permissions.json';
import * as Factories from '../../factories'
import { makeUniqueId } from '../../../utils/generator';
import { ITower } from 'models/tower.model';
import { IRoom } from 'models/room.model';
import { IMember } from 'models/member.model';
import { IMachine } from 'models/machine.model';

const create = async (args: { name: string, creatorId: string }, _session?: ClientSession) => {
  if (isEmpty(args.name)) {
    console.error('title can not be empty');
    return { success: false };
  }
  if (isNameFieldInvalid(args.name)) {
    console.error('title can not be longer than limit');
    return { success: false };
  }
  const session = _session ? _session : await mongoose.startSession();
  if (!_session) session.startTransaction();
  let machine: IMachine;
  try {
    machine = await Factories.MachineFactory.instance.create({
      id: makeUniqueId(),
      name: args.name,
      secret: {
        token: makeUniqueId(),
        creatorId: args.creatorId
      }
    }, session);
    if (!_session) {
      await session.commitTransaction();
      session.endSession();
    }
    return { success: true, machine }
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

export default create
