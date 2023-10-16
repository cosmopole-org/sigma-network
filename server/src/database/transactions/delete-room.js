
const mongoose = require('mongoose');
let { Tower, Room } = require('../schemas/schemas');
let { isEmpty, isNameFieldInvalid } = require('../../../../shared/utils/strings');
let defaultAvatars = require('../../../../constants/avatars.json');
const PendingFactory = require('../factories/pending-factory');
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
}

module.exports.dbDeleteRoom = async ({ towerId, roomId }, userId) => {
  checkImports();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let success = false;
    let tower = await TowerFactory.instance().find({ _id: towerId }, session);
    if (tower !== null) {
      let room = await RoomFactory.instance().find({ id: roomId, towerId: towerId }, session);
      if (tower.secret.adminIds.includes(userId) || room.secret.adminIds.includes(userId)) {
        await RoomFactory.instance().remove({ id: roomId }, session);
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
    return { success: success };
  } catch (error) {
    console.error(error);
    console.error('abort transaction');
    await session.abortTransaction();
    session.endSession();
    return { success: false };
  }
};
