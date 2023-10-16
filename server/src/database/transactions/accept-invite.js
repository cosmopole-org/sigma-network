
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

module.exports.dbAcceptInvite = async ({ inviteId }, userId, callback) => {
  if (isIdEmpty(inviteId)) {
    console.error('invite id can not be empty');
    return { success: false };
  }
  checkImports();
  const session = await mongoose.startSession();
  session.startTransaction();
  let member, room, tower, rooms, memberships;
  try {
    let invite = await InviteFactory.instance().find({ id: inviteId, userId: userId });
    if (invite !== null) {
      room = await RoomFactory.instance().find({ id: invite.roomId }, session);
      Promise.all([
        (async () => { tower = await TowerFactory.instance().find({ id: room.towerId }, session); })(),
        (async () => {
          member = await MemberFactory.instance().create({
            id: makeUniqueId(),
            userId: invite.userId,
            roomId: invite.roomId,
            towerId: room.towerId,
            secret: {
              permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
            }
          }, session);
        })(),
        (async () => { await InviteFactory.instance().remove({ id: invite.id }, session); })(),
        (async () => { rooms = await RoomFactory.instance().findGroup({ towerId: room.towerId }, session); })(),
        (async () => { memberships = await MemberFactory.instance().findGroup({ roomId: invite.roomId }, session); })()
      ]).then(async () => {
        let user = (await UserFactory.instance().find({ id: member.userId }, session))._doc;
        await session.commitTransaction();
        session.endSession();
        callback({
          success: true,
          member: member,
          rooms: rooms.map(r => secureAdmins(r, userId)),
          tower,
          room,
          memberships,
          update: {
            type: updates.USER_JOINED_ROOM,
            roomId: room.id,
            user: secureObject(user, 'secret'),
            member: member
          }
        });
      });
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
