
const mongoose = require('mongoose');
let { Tower, Room, RoomInvite } = require('../schemas/schemas');
let { isIdEmpty } = require('../../../../shared/utils/numbers');
const updates = require('../../../../constants/updates.json');
const InviteFactory = require('../factories/invite-factory');
const RoomFactory = require('../factories/room-factory');
const TowerFactory = require('../factories/tower-factory');
const MemberFactory = require('../factories/member-factory');

const checkImports = () => {
  if (Tower === undefined) {
    Tower = require('../schemas/schemas').Tower;
  }
  if (Room === undefined) {
    Room = require('../schemas/schemas').Room;
  }
  if (RoomInvite === undefined) {
    RoomInvite = require('../schemas/schemas').RoomInvite;
  }
}

module.exports.dbCancelInvite = async ({ inviteId }, userId) => {
  if (isIdEmpty(inviteId)) {
    console.error('invite id can not be empty');
    return { success: false };
  }
  checkImports();
  const session = await mongoose.startSession();
  session.startTransaction();
  let targetUserId;
  try {
    let success = false;
    let invite = await InviteFactory.instance().find({ id: inviteId }, session);
    if (invite !== null) {
      targetUserId = invite.userId;
      let room = await RoomFactory.instance().find({ id: invite.roomId }, session);
      let tower = await TowerFactory.instance().find({ id: room.towerId }, session);
      if (tower.secret.adminIds.includes(userId) || room.secret.adminIds.includes(userId)) {
        await InviteFactory.instance().remove({ id: invite.id }, session);
        success = true;
        await session.commitTransaction();
      } else {
        console.error('access denied');
        console.error('abort transaction');
        await session.abortTransaction();  
      }
    } else {
      console.error('invite not found');
      console.error('abort transaction');
      await session.abortTransaction();
    }
    session.endSession();
    if (success) {
      if (targetUserId) {
        return { success: true, update: { type: updates.INVITE_CANCELLED, inviteId: inviteId, userId: targetUserId }  };
      } else {
        return { success: true };
      }
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error('abort transaction');
    await session.abortTransaction();
    session.endSession();
    return { success: false };
  }
};
