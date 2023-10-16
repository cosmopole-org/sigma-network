
const mongoose = require('mongoose');
let { Tower, Room, Member, Workspace } = require('../schemas/schemas');
let { isEmpty, isNameFieldInvalid } = require('../../../../shared/utils/strings');
let defaultAvatars = require('../../../../constants/avatars.json');
const permissions = require('../../../../constants/permissions.json');
const InviteFactory = require('../factories/invite-factory');
const RoomFactory = require('../factories/room-factory');
const TowerFactory = require('../factories/tower-factory');
const MemberFactory = require('../factories/member-factory');
const UserFactory = require('../factories/user-factory');
const InteractionFactory = require('../factories/interaction-factory');
const { makeUniqueId } = require('../../../../shared/utils/id-generator');
const MemoryDriver = require('../../memory');

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

module.exports.createTower = async ({ title, avatarId, isPublic }, userId) => {
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
  let tower, room, member;
  try {
    tower = await TowerFactory.instance().create({
      id: makeUniqueId(),
      title: title,
      avatarId: isEmpty(avatarId) ? defaultAvatars.EMPTY_TOWER_AVATAR_ID : avatarId,
      isPublic: isPublic,
      secret: {
        adminIds: [
          userId
        ]
      }
    }, session);
    room = await RoomFactory.instance().create({
      id: makeUniqueId(),
      title: 'hall',
      avatarId: defaultAvatars.HALL_DEFAULT_AVATAR_ID,
      floor: 'hall',
      towerId: tower.id,
      secret: {
        adminIds: [
          userId
        ]
      }
    }, session);
    if (userId) {
      member = await MemberFactory.instance().create({
        id: makeUniqueId(),
        userId: userId,
        roomId: room.id,
        towerId: tower.id,
        secret: {
          permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
        }
      }, session);
    }
    await session.commitTransaction();
    session.endSession();
    return { success: true, tower: tower, room: room, member: member };
  } catch (error) {
    console.error(error);
    console.error('abort transaction');
    await session.abortTransaction();
    session.endSession();
    return { success: false };
  }
}

module.exports.dbCreateTower = this.createTower;
