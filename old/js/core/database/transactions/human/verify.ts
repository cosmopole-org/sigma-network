
import mongoose, { ClientSession } from 'mongoose'
import * as Factories from '../../factories';
import { makeUniqueId } from '../../../utils/generator';
import { IPending } from '../../../models/pending.model';
import { ISession } from '../../../models/session.model';
import { IHuman } from '../../../models/human.model';
import config from 'config';

const verify = async (args: { cCode?: string, vCode?: string, accessToken?: string }, _session?: ClientSession) => {
    const session = _session ? _session : await mongoose.startSession();
    if (!_session) session.startTransaction();
    let pending: IPending, userSession: ISession, human: IHuman;
    try {
        let handlePostAuth = async () => {
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
                if (args.accessToken) {
                    await Factories.PendingFactory.instance.update({ cCode: args.accessToken }, { progress: 'verified' }, session);
                } else {
                    await Factories.PendingFactory.instance.update({ cCode: args.cCode, vCode: args.vCode }, { progress: 'verified' }, session);
                }
                if (!_session) {
                    await session.commitTransaction();
                    session.endSession();
                }
                return { success: true };
            }
        }
        if (args.accessToken) {
            let d = Buffer.from(args.accessToken.split('.')[1], 'base64').toString()
            const inputData = JSON.parse(d);
            let email = inputData[config['AUTH0_TOKEN_EMAIL_DECODER_KEY']];
            pending = await Factories.PendingFactory.instance.find({ email }, session);
            if (pending !== null) {
                pending = await Factories.PendingFactory.instance.update({ email }, { progress: 'verified', cCode: args.accessToken, vCode: args.accessToken }, session);
            } else {
                pending = await Factories.PendingFactory.instance.create({ progress: 'verified', email, cCode: args.accessToken, vCode: args.accessToken }, session);
            }
            return await handlePostAuth();
        } else {
            pending = await Factories.PendingFactory.instance.find({ vCode: args.vCode, cCode: args.cCode }, session);
            if (pending !== null) {
                return await handlePostAuth();
            } else {
                if (!_session) {
                    await session.abortTransaction();
                    session.endSession();
                }
                return { success: false };
            }
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
