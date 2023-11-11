
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'

const update = async (args: { firstName?: string, lastName?: string, humanId: string }, _session?: ClientSession) => {
    const session = _session ? _session : await mongoose.startSession();
    if (!_session) session.startTransaction();
    try {
        let human = await Factories.HumanFactory.instance.find({ id: args.humanId }, session)
        if (human !== null) {
            human = await Factories.HumanFactory.instance.update(
                {
                    id: args.humanId,
                },
                {
                    firstName: args.firstName,
                    lastName: args.lastName,
                },
                session
            );
            if (!_session) {
                await session.commitTransaction();
                session.endSession();
            }
            return {
                success: true,
                human
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

export default update
