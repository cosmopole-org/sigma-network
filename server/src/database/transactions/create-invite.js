
const mongoose = require('mongoose');
let { Tower, Room, User, RoomInvite } = require('../schemas/schemas');
let { isIdEmpty } = require('../../../../shared/utils/numbers');
let { isInviteTitleInvalid, isInviteTextInvalid } = require('../../../../shared/utils/strings');
const updates = require('../../../../constants/updates.json');
const InviteFactory = require('../factories/invite-factory');
const RoomFactory = require('../factories/room-factory');
const TowerFactory = require('../factories/tower-factory');
const MemberFactory = require('../factories/member-factory');
const UserFactory = require('../factories/user-factory');
const InteractionFactory = require('../factories/interaction-factory');
const { makeUniqueId } = require('../../../../shared/utils/id-generator');

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
  if (User === undefined) {
    User = require('../schemas/schemas').User;
  }
}

module.exports.dbCreateInvite = async ({ roomId, targetUserId, title, text }, userId) => {
  if (isIdEmpty(roomId)) {
    console.error('room id can not be empty');
    return { success: false };
  }
  if (isIdEmpty(targetUserId)) {
    console.error('user id can not be empty');
    return { success: false };
  }
  if (isInviteTitleInvalid(title)) {
    console.error('invite title can not be empty or longer than 64 characters');
    return { success: false };
  }
  if (isInviteTextInvalid(text)) {
    console.error('invite title can not be empty or longer than 64 characters');
    return { success: false };
  }
  checkImports();
  const session = await mongoose.startSession();
  session.startTransaction();
  let invite;
  try {
    let success = false;
    invite = await InviteFactory.instance().find({ userId: targetUserId, roomId: roomId }, session);
    if (invite === null) {
      let room = await RoomFactory.instance().find({ id: roomId }, session);
      if (room !== null) {
        let tower = await TowerFactory.instance().find({ id: room.towerId }, session);
        if (tower.secret.adminIds.includes(userId) || room.secret.adminIds.includes(userId)) {
          let user = await UserFactory.instance().find({ id: targetUserId }, session);
          if (user !== null) {
            invite = await InviteFactory.instance().create({
              id: makeUniqueId(),
              userId: targetUserId,
              roomId: roomId,
              title: title,
              text: text
            }, session);
            success = true;
            await session.commitTransaction();
          } else {
            console.error('user not found');
            console.error('abort transaction');
            await session.abortTransaction();
          }
        } else {
          console.error('user is not admin of the tower or room');
          console.error('abort transaction');
          await session.abortTransaction();
        }
      } else {
        console.error('room does not exist');
        console.error('abort transaction');
        await session.abortTransaction();
      }
    } else {
      console.error('invite already exists');
      console.error('abort transaction');
      await session.abortTransaction();
    }
    session.endSession();
    if (success) {
      return { success: true, invite: invite, update: { type: updates.NEW_INVITE, invite: invite, userId: targetUserId } };
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
