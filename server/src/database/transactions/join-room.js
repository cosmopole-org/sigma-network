
const mongoose = require('mongoose');
let { RoomInvite, Member, Room, Tower, Workspace } = require('../schemas/schemas');
let { isIdEmpty } = require('../../../../shared/utils/numbers');
const permissions = require('../../../../constants/permissions.json');
const updates = require('../../../../constants/updates.json');
const { secureObject, secureAdmins } = require('../../../../shared/utils/filter');
const InviteFactory = require('../factories/invite-factory');
const RoomFactory = require('../factories/room-factory');
const TowerFactory = require('../factories/tower-factory');
const MemberFactory = require('../factories/member-factory');
const UserFactory = require('../factories/user-factory');
const { makeUniqueId } = require('../../../../shared/utils/id-generator');

const checkImports = () => {
  if (RoomInvite === undefined) {
    RoomInvite = require('../schemas/schemas').RoomInvite;
  }
  if (Member === undefined) {
    Member = require('../schemas/schemas').Member;
  }
  if (Room === undefined) {
    Room = require('../schemas/schemas').Room;
  }
  if (Tower === undefined) {
    Tower = require('../schemas/schemas').Tower;
  }
  if (Workspace === undefined) {
    Workspace = require('../schemas/schemas').Workspace;
  }
}

module.exports.dbJoinRoom = async ({ roomId }, userId, callback) => {
  if (isIdEmpty(roomId)) {
    console.error('room id can not be empty');
    return { success: false };
  }
  checkImports();
  const session = await mongoose.startSession();
  session.startTransaction();
  let member, user, room, tower;
  try {
    room = await RoomFactory.instance().find({ id: roomId }, session);
    if (room.isPublic) {
      member = await MemberFactory.instance().find({ userId: userId, roomId: roomId }, session);
      const onResult = async () => {
        user = (await UserFactory.instance().find({ id: userId }, session));
        user = user._doc;
        await session.commitTransaction();
        session.endSession();
        callback({
          success: true,
          member: member,
          tower,
          room,
          update: {
            type: updates.USER_JOINED_ROOM,
            roomId: room.id,
            user: secureObject(user, 'secret'),
            member: member
          }
        });
      }
      if (member !== null) {
        tower = await TowerFactory.instance().find({ id: room.towerId }, session);
        await onResult();
      } else {
        Promise.all([
          (async () => { tower = await TowerFactory.instance().find({ id: room.towerId }, session); })(),
          (async () => {
            member = await MemberFactory.instance().create({
              id: makeUniqueId(),
              userId: userId,
              roomId: roomId,
              towerId: room.towerId,
              secret: {
                permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
              }
            }, session);
          })()
        ]).then(async () => {
          await onResult();
        });
      }
    } else {
      console.error('invite not found');
      console.error('abort transaction');
      await session.abortTransaction();
      session.endSession();
      callback({ success: false });
    }
  } catch (error) {
    console.error(error);
    console.error('abort transaction');
    await session.abortTransaction();
    session.endSession();
    callback({ success: false });
  }
};
