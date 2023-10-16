
const mongoose = require('mongoose');
let { isIdEmpty } = require('../../../../shared/utils/numbers');
const PendingFactory = require('../factories/pending-factory');
const InviteFactory = require('../factories/invite-factory');
const RoomFactory = require('../factories/room-factory');
const TowerFactory = require('../factories/tower-factory');
const MemberFactory = require('../factories/member-factory');
const UserFactory = require('../factories/user-factory');
const InteractionFactory = require('../factories/interaction-factory');
const { makeUniqueId } = require('../../../../shared/utils/id-generator');


module.exports.dbReadInviteByRoomId = async ({ roomId }, userId) => {
  if (isIdEmpty(roomId)) {
    console.error('room id can not be empty');
    return { success: false };
  }
  try {
    let invite = await InviteFactory.instance().find({ roomId: roomId, userId: userId });
    if (invite !== null) {
      let room = await RoomFactory.instance().find({ id: roomId });
      let tower = await TowerFactory.instance().find({ id: room.towerId });
      return {
        success: true,
        invite,
        room,
        tower
      };
    } else {
      console.error('invite not found');
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};
