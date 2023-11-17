
import mongoose, { ClientSession } from 'mongoose'
import * as Factories from '../../factories';
import { makeUniqueId } from '../../../utils/generator';
import { IPending } from '../../../models/pending.model';
import { ISession } from '../../../models/session.model';
import { IHuman } from '../../../models/human.model';
import { secureObject } from '../../../utils/filter';

const verify = async (args: { cCode: string, vCode: string }, _session?: ClientSession) => {
    const session = _session ? _session : await mongoose.startSession();
    if (!_session) session.startTransaction();
    let pending: IPending, userSession: ISession, human: IHuman;
    try {
        pending = await Factories.PendingFactory.instance.find({ vCode: args.vCode, cCode: args.cCode }, session);
        if (pending !== null) {
            human = await Factories.HumanFactory.instance.find({ id: pending.humanId }, session);
            if (human !== null) {
                userSession = await Factories.SessionFactory.instance.create({
                    id: makeUniqueId(),
                    token: makeUniqueId(),
                    humanId: human.id
                }, session);
                human = await Factories.HumanFactory.instance.update({ id: human.id }, { $push: { sessionIds: userSession.id } }, session);
                let memberships = await Factories.MemberFactory.instance.findGroup({ humanId: human.id }, session);
                let towers = await Factories.TowerFactory.instance.findGroup({ id: { $in: memberships.map(m => m.towerId) } }, session);
                let rooms = await Factories.RoomFactory.instance.findGroup({ towerId: { $in: memberships.map(m => m.towerId) } }, session);
                let allMemberships = await Factories.MemberFactory.instance.findGroup({ towerId: { $in: towers.map(t => t.id) } }, session);
                if (!_session) {
                    await session.commitTransaction();
                    session.endSession();
                }
                return {
                    success: true,
                    session: userSession,
                    human: human,
                    towers: towers,
                    rooms: rooms,
                    memberships: memberships
                };
            } else {
                await Factories.PendingFactory.instance.update({ cCode: args.cCode, vCode: args.vCode }, { progress: 'verified' }, session);
                if (!_session) {
                    await session.commitTransaction();
                    session.endSession();
                }
                return { success: true };
            }
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

export default verify
