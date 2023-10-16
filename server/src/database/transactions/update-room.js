
const mongoose = require('mongoose');
let { Tower, Room } = require('../schemas/schemas');
let { isEmpty, isNameFieldInvalid } = require('../../../../shared/utils/strings');
let defaultAvatars = require('../../../../constants/avatars.json');
const SessionFactory = require('../factories/session-factory');
const PendingFactory = require('../factories/pending-factory');
const InviteFactory = require('../factories/invite-factory');
const RoomFactory = require('../factories/room-factory');
const TowerFactory = require('../factories/tower-factory');
const MemberFactory = require('../factories/member-factory');
const UserFactory = require('../factories/user-factory');
const InteractionFactory = require('../factories/interaction-factory');
const { makeUniqueId } = require('../../../../shared/utils/id-generator');
const updates = require('../../../../constants/updates.json');

const checkImports = () => {
  if (Tower === undefined) {
    Tower = require('../schemas/schemas').Tower;
  }
  if (Room === undefined) {
    Room = require('../schemas/schemas').Room;
  }
}

module.exports.dbUpdateRoom = async ({ towerId, roomId, title, avatarId, isPublic, wallpaperId }, userId) => {
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
  try {
    let success = false;
    let room;
    let tower = await TowerFactory.instance().find({ id: towerId }, session);
    if (tower !== null) {
      room = await RoomFactory.instance().find({ id: roomId, towerId: towerId }, session);
      if (tower.secret.adminIds.includes(userId) || room.secret.adminIds.includes(userId)) {
        await RoomFactory.instance().update({ id: roomId }, {
          title: title,
          avatarId: isEmpty(avatarId) ? defaultAvatars.EMPTY_ROOM_AVATAR_ID : avatarId,
          isPublic: isPublic,
          wallpaperId: wallpaperId
        }, session);
        room = await RoomFactory.instance().find({ id: roomId, towerId: towerId }, session);
        success = true;
        await session.commitTransaction();
      } else {
        console.error('user is not admin of the tower or room');
        console.error('abort transaction');
        await session.abortTransaction();
      }
    } else {
      console.error('tower does not exist');
      console.error('abort transaction');
      await session.abortTransaction();
    }
    session.endSession();
    return { success: success, update: { type: updates.DESKTOP_UPDATED, room: room, roomId: room.id } };
  } catch (error) {
    console.error(error);
    console.error('abort transaction');
    await session.abortTransaction();
    session.endSession();
    return { success: false };
  }
};
