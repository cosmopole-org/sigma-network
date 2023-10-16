
const mongoose = require('mongoose');
const UserFactory = require('../factories/user-factory');

module.exports.dbUpdatePublicKey = async ({ publicKey }, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        user = await UserFactory.instance().update({
            id: userId,
        }, { publicKey: publicKey }, session);
        await session.commitTransaction();
        session.endSession();
        return {
            success: true,
        };
    } catch (error) {
        console.error(error);
        console.error('abort transaction');
        await session.abortTransaction();
        session.endSession();
        return { success: false };
    }
}
