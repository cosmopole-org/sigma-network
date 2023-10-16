
const mongoose = require('mongoose');
let { Tower, Room } = require('../schemas/schemas');
const { isEmpty, isNameFieldInvalid } = require('../../../../shared/utils/strings');
const defaultAvatars = require('../../../../constants/avatars.json');
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

module.exports.dbUpdateTower = async ({ towerId, title, avatarId, isPublic }, userId) => {
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
    let tower = await TowerFactory.instance().find({id: towerId}, session);
    if (tower !== null) {
      if (tower.secret.adminIds.includes(userId)) {
        await TowerFactory.instance().update({id: tower.id}, {
          title: title,
          avatarId: isEmpty(avatarId) ? defaultAvatars.EMPTY_TOWER_AVATAR_ID : avatarId,
          isPublic: isPublic
        }, session);
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
    return { success: success };
  } catch (error) {
    console.error(error);
    console.error('abort transaction');
    await session.abortTransaction();
    session.endSession();
    return { success: false };
  }
};
