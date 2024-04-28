
import mongoose, { ClientSession } from 'mongoose';
import { isEmpty, isNameFieldInvalid } from '../../../utils/strings';
import permissions from '../../../permissions.json';
import { makeUniqueId } from '../../../utils/generator';
import { IPending } from '../../../models/pending.model';
import { IHuman } from '../../../models/human.model';
import { ISession } from '../../../models/session.model';
import { ITower } from '../../../models/tower.model';
import { IRoom } from '../../../models/room.model';
import { IMember } from '../../../models/member.model';
import * as Factories from '../../factories'

const complete = async (args: { cCode: string, firstName: string, lastName?: string, creationCallback: any }, _session?: ClientSession) => {
    if (isEmpty(args.firstName)) {
        console.error('first name can not be empty');
        return { success: false };
    }
    if (isNameFieldInvalid(args.firstName)) {
        console.error('name can not be longer than limit.');
        return { success: false };
    }
    const session = _session ? _session : await mongoose.startSession();
    if (!_session) session.startTransaction();
    let pending: IPending, human: IHuman, sess: ISession, tower: ITower, room: IRoom, member: IMember
    try {
        pending = await Factories.PendingFactory.instance.find({ cCode: args.cCode }, session);
        if (pending?.progress === 'verified') {
            let userGenedId = makeUniqueId();
            sess = await Factories.SessionFactory.instance.create({
                id: makeUniqueId(),
                token: makeUniqueId(),
                humanId: userGenedId,
            }, session);
            let towerGenedId = makeUniqueId();
            let roomGenedId = makeUniqueId();
            human = await Factories.HumanFactory.instance.create({
                id: userGenedId,
                firstName: args.firstName,
                lastName: args.lastName,
                secret: {
                    email: pending.email,
                    homeId: towerGenedId,
                    sessionIds: [sess.id]
                }
            }, session);
            await Factories.PendingFactory.instance.update({ cCode: args.cCode }, { humanId: human.id }, session)
            tower = await Factories.TowerFactory.instance.create({
                id: towerGenedId,
                title: `${args.firstName}'s home`,
                avatarId: 'EMPTY',
                isPublic: false,
                secret:
                {
                    ownerId: human.id,
                    adminIds: [
                        userGenedId
                    ]
                }
            }, session);
            room = await Factories.RoomFactory.instance.create({
                id: roomGenedId,
                title: 'hall',
                avatarId: 'EMPTY',
                isPublic: false,
                floor: 'hall',
                towerId: towerGenedId,
                secret: {
                    adminIds: [
                        userGenedId
                    ]
                }
            }, session);
            args.creationCallback && await args.creationCallback(room, session)
            member = await Factories.MemberFactory.instance.create({
                id: makeUniqueId(),
                humanId: human.id,
                towerId: tower.id,
                secret: {
                    permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
                }
            }, session);
            if (!_session) {
                await session.commitTransaction();
                session.endSession();
            }
            return {
                success: true,
                session: sess,
                human,
                tower,
                room,
                member,
            };
        } else {
            if (!_session) {
                await session.abortTransaction();
                session.endSession();
            }
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
}

export default complete
