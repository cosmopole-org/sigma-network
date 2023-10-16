
const mongoose = require('mongoose');
let { Member, Room, Tower } = require('../schemas/schemas');
const updates = require('../../../../constants/updates.json');
const PendingFactory = require('../factories/pending-factory');
const InviteFactory = require('../factories/invite-factory');
const RoomFactory = require('../factories/room-factory');
const TowerFactory = require('../factories/tower-factory');
const MemberFactory = require('../factories/member-factory');
const UserFactory = require('../factories/user-factory');
const InteractionFactory = require('../factories/interaction-factory');
const { makeUniqueId } = require('../../../../shared/utils/id-generator');

const checkImports = () => {
  if (Member === undefined) {
    Member = require('../schemas/schemas').Member;
  }
  if (Room === undefined) {
    Room = require('../schemas/schemas').Room;
  }
  if (Tower === undefined) {
    Tower = require('../schemas/schemas').Tower;
  }
}

module.exports.dbModifyPermissions = async ({ roomId, permissions, targetUserId }, userId) => {
  if (permissions === undefined) {
    console.error('permissions can not be empty');
    return { success: false };
  }
  if (targetUserId === userId) {
    console.error('access denied');
    return { success: false };
  }
  checkImports();
  const session = await mongoose.startSession();
  session.startTransaction();
  let member;
  try {
    let success = false;
    let room = await RoomFactory.instance().find({ id: roomId }, session);
    let tower = await TowerFactory.instance().find({ id: room.towerId }, session);
    if (room !== null) {
      if (room.secret?.adminIds.includes(userId) && !tower.secret.adminIds.includes(targetUserId) && !room.secret.adminIds.includes(targetUserId)) {
        await MemberFactory.instance().update({ userId: targetUserId, roomId: roomId }, {
          secret: {
            permissions: permissions
          }
        }, session);
        member = await MemberFactory.instance().find({ userId: targetUserId, roomId: roomId }, session);
        await session.commitTransaction();
        success = true;
      } else {
        if (tower.secret?.adminIds.includes(userId) && !tower.secret.adminIds.includes(targetUserId)) {
          await MemberFactory.instance().update({ userId: targetUserId, roomId: roomId }, {
            secret: {
              permissions: permissions
            }
          }, session);
          member = await MemberFactory.instance().find({ userId: targetUserId, roomId: roomId }, session);
          await session.commitTransaction();
          success = true;
        } else {
          console.error('access denied');
          console.error('abort transaction');
          await session.abortTransaction();
        }
      }
    } else {
      console.error('room does not exist');
      console.error('abort transaction');
      await session.abortTransaction();
    }
    session.endSession();
    return {
      success: success,
      update: { type: updates.PERMISSIONS_MODIFIED, member: member, userId: targetUserId }
    };
  } catch (error) {
    console.error(error);
    console.error('abort transaction');
    await session.abortTransaction();
    session.endSession();
    return { success: false };
  }
};
