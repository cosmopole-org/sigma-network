
import mongoose, { ClientSession } from 'mongoose'
import * as Factories from '../../factories';
import { makeUniqueId } from '../../../utils/generator';
import MemoryDriver from '../../../drivers/memory/memory';
import { IPending } from 'src/models/pending.model';
import { ISession } from 'src/models/session.model';
import { IHuman } from '../../../models/human.model';

const verify = async (args: { cCode: string, vCode: string }, _session?: ClientSession) => {
    const session = _session ? _session : await mongoose.startSession();
    if (!_session) session.startTransaction();
    let pending: IPending, userSession: ISession, human: IHuman;
    try {
        pending = await Factories.PendingFactory.instance.find({ vCode: args.vCode, cCode: args.cCode }, session);
        if (pending !== null) {
            human = await Factories.HumanFactory.instance.find({ id: pending.userId }, session);
            if (human !== null) {
                userSession = await Factories.SessionFactory.instance.create({
                    id: makeUniqueId(),
                    token: makeUniqueId(),
                    userId: human.id
                }, session);
                await MemoryDriver.instance.save(`auth:${userSession.token}`, human.id);
                human = await Factories.HumanFactory.instance.update({ id: human.id }, { $push: { sessionIds: userSession.id } }, session);
                let memberships = await Factories.MemberFactory.instance.findGroup({ userId: human.id }, session);
                let towers = await Factories.TowerFactory.instance.findGroup({ id: { $in: memberships.map(m => m.towerId) } }, session);
                let rooms = await Factories.RoomFactory.instance.findGroup({ towerId: { $in: memberships.map(m => m.towerId) } }, session);
                let allMemberships = await Factories.MemberFactory.instance.findGroup({ roomId: { $in: rooms.map(r => r.id) } }, session);
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
                    myMemberships: memberships,
                    allMemberships: allMemberships,
                };
            } else {
                if (!_session) {
                    await session.commitTransaction();
                    session.endSession();
                }
                return { success: true };
            }
        } else {
            if (!_session) {
                await session.commitTransaction();
                session.endSession();
            }
            return { success: true };
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
