
const mongoose = require('mongoose');
let { Room, Member, RoomInvite, Tower } = require('../schemas/schemas');
const { secureObject, secureAdmins } = require('../../../../shared/utils/filter');
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
  if (RoomInvite === undefined) {
    RoomInvite = require('../schemas/schemas').RoomInvite;
  }
  if (Room === undefined) {
    Room = require('../schemas/schemas').Room;
  }
  if (Tower === undefined) {
    Tower = require('../schemas/schemas').Tower;
  }
}

module.exports.dbReadRoomById = async ({ roomId }, userId) => {
  checkImports();
  const session = await mongoose.startSession();
  session.startTransaction();
  let success = false;
  try {
    let room = await RoomFactory.instance().find({ id: roomId }, session);
    if (room !== null) {
      if (room.isPublic) {
        success = true;
      } else {
        let member = await MemberFactory.instance().find({ userId: userId, roomId: roomId }, session);
        if (member !== null) {
          success = true;
        } else {
          let invite = await InviteFactory.instance().find({ userId: userId, roomId: roomId }, session);
          if (invite !== null) {
            success = true;
          }
        }
      }
    }
    let tower;
    if (success) {
      tower = await TowerFactory.instance().find({ id: room.towerId }, session);
    }
    await session.commitTransaction();
    session.endSession();
    if (success) {
      return { success: true, tower: secureAdmins(tower, userId), room: secureAdmins(room, userId) };
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
}
