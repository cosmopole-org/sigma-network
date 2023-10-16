
const mongoose = require('mongoose');
let { RoomInvite } = require('../schemas/schemas');
let { isIdEmpty } = require('../../../../shared/utils/numbers');
const PendingFactory = require('../factories/pending-factory');
const InviteFactory = require('../factories/invite-factory');
const RoomFactory = require('../factories/room-factory');
const TowerFactory = require('../factories/tower-factory');
const MemberFactory = require('../factories/member-factory');
const UserFactory = require('../factories/user-factory');
const InteractionFactory = require('../factories/interaction-factory');
const { makeUniqueId } = require('../../../../shared/utils/id-generator');

const checkImports = () => {
  if (RoomInvite === undefined) {
    RoomInvite = require('../schemas/schemas').RoomInvite;
  }
}

module.exports.dbDeclineInvite = async ({ inviteId }, userId) => {
  if (isIdEmpty(inviteId)) {
    console.error('invite id can not be empty');
    return { success: false };
  }
  checkImports();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let success = false;
    let invite = await InviteFactory.instance().find({ id: inviteId, userId: userId }, session);
    if (invite !== null) {
      await InviteFactory.instance().delete({ id: invite.id }, session);
      success = true;
      await session.commitTransaction();
    } else {
      console.error('invite not found');
      console.error('abort transaction');
      await session.abortTransaction();
    }
    session.endSession();
    if (success) {
      return { success: true };
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
