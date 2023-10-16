
const mongoose = require('mongoose');
const { isReadCountEmpty, isReadCountInvalid, isIdEmpty } = require('../../../../shared/utils/numbers');
const { secureObject, secureAdmins } = require('../../../../shared/utils/filter');
const PendingFactory = require('../factories/pending-factory');
const InviteFactory = require('../factories/invite-factory');
const RoomFactory = require('../factories/room-factory');
const TowerFactory = require('../factories/tower-factory');
const MemberFactory = require('../factories/member-factory');
const UserFactory = require('../factories/user-factory');
const InteractionFactory = require('../factories/interaction-factory');
const { makeUniqueId } = require('../../../../shared/utils/id-generator');

module.exports.dbReadUsers = async ({ query, offset, count }, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let data = await UserFactory.instance().read(offset, count, {
      $or: [
        { firstName: { '$regex': query, '$options': 'i' }, isGuest: false },
        { lastName: { '$regex': query, '$options': 'i' }, isGuest: false }
      ],
    });
    await session.commitTransaction();
    session.endSession();
    return { success: true, users: data.map(u => secureObject(u, 'secret')) };
  } catch (error) {
    console.error(error);
    console.error('abort transaction');
    await session.abortTransaction();
    session.endSession();
    return { success: false };
  }
}
