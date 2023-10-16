
const mongoose = require('mongoose');
const MemberFactory = require('../factories/member-factory');
const RoomFactory = require('../factories/room-factory');
const UserFactory = require('../factories/user-factory');

module.exports.logout = async ({}, userId) => {
  console.log(userId);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let memberships = await MemberFactory.instance().findGroup({ userId: userId }, session);
    let rooms = await RoomFactory.instance().findGroup({ id: memberships.map(m => m.roomId) }, session);
    await UserFactory.instance().update({ id: userId }, { lastSeen: Date.now() }, session);
    await session.commitTransaction();
    session.endSession();
    return { success: true, roomIds: rooms.map(room => room.id) };
  } catch (error) {
    console.error(error);
    console.error('abort transaction');
    await session.abortTransaction();
    session.endSession();
    return { success: false };
  }
}

module.exports.dbLogout = this.logout;
