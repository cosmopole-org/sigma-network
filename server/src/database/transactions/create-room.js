
const mongoose = require('mongoose');
let { Tower, Room, Member, Workspace } = require('../schemas/schemas');
let { isEmpty, isNameFieldInvalid } = require('../../../../shared/utils/strings');
const defaultAvatars = require('../../../../constants/avatars.json');
const permissions = require('../../../../constants/permissions.json');
const updates = require('../../../../constants/updates.json');
const { secureObject, secureAdmins } = require('../../../../shared/utils/filter');
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
  if (Member === undefined) {
    Member = require('../schemas/schemas').Member;
  }
  if (Workspace === undefined) {
    Workspace = require('../schemas/schemas').Workspace;
  }
}

module.exports.dbCreateRoom = async ({ towerId, title, avatarId, isPublic, floor }, userId) => {
  if (isEmpty(title)) {
    console.error('title can not be empty');
    return { success: false };
  }
  if (isNameFieldInvalid(title)) {
    console.error('title can not be longer than limit');
    return { success: false };
  }
  checkImports();
  const session = await mongoose.startSession();
  session.startTransaction();
  let room, member, member2;
  try {
    let success = false;
    let tower = await TowerFactory.instance().find({ id: towerId }, session);
    if (tower !== null) {
      if (tower.secret.adminIds.includes(userId)) {
        room = await RoomFactory.instance().create({
          id: makeUniqueId(),
          title: title,
          avatarId: isEmpty(avatarId) ? defaultAvatars.EMPTY_ROOM_AVATAR_ID : avatarId,
          towerId: towerId,
          isPublic: isPublic,
          floor: floor,
          secret: {
            adminIds: [
              userId
            ]
          }
        }, session);
        member = await MemberFactory.instance().create({
          id: makeUniqueId(),
          userId: userId,
          roomId: room.id,
          towerId: tower.id,
          secret: {
            permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
          }
        }, session);
        if (tower.secret.isContact) {
          member2 = await MemberFactory.instance().create({
            id: makeUniqueId(),
            userId: tower.secret.adminIds[0] === userId ? tower.secret.adminIds[1] : tower.secret.adminIds[0],
            roomId: room.id,
            towerId: tower.id,
            secret: {
              permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
            }
          }, session);
        }
        success = true;
        await session.commitTransaction();
      } else {
        console.error('user is not admin of the tower');
        console.error('abort transaction');
        await session.abortTransaction();
      }
    } else {
      console.error('tower does not exist');
      console.error('abort transaction');
      await session.abortTransaction();
    }
    session.endSession();
    if (success) {
      return {
        success: true, room: room, member: member, member2: member2,
        update: { type: updates.NEW_ROOM, room: secureAdmins(room, userId), towerId: towerId, exceptions: [userId] }
      };
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
