
const mongoose = require('mongoose');
const { isReadCountEmpty, isReadCountInvalid, isIdEmpty } = require('../../../../shared/utils/numbers');
let { Member, User } = require('../schemas/schemas');
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
  if (User === undefined) {
    User = require('../schemas/schemas').User;
  }
}

module.exports.dbReadTowers = async ({ query, offset, count, mine }, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  checkImports();
  let data;
  try {
    if (mine) {
      let members = await MemberFactory.instance().findGroup({ userId: userId }, session);
      if (offset === undefined && count === undefined) {
        data = await TowerFactory.instance().read(0, 100, {
          $or: [
            { title: { '$regex': query, '$options': 'i' }, id: { $in: members.map(m => m.towerId) } },
            { description: { '$regex': query, '$options': 'i' }, id: { $in: members.map(m => m.towerId) } }
          ]
        });
      } else {
        data = await TowerFactory.instance().read(offset, count, {
          isPublic: true,
          $or: [
            { title: { '$regex': query, '$options': 'i' }, id: { $in: members.map(m => m.towerId) } },
            { description: { '$regex': query, '$options': 'i' }, id: { $in: members.map(m => m.towerId) } }
          ]
        });
      }
    } else {
      if (isReadCountEmpty(count)) {
        console.error('count can not be empty');
        console.error('abort transaction');
        await session.abortTransaction();
        session.endSession();
        return { success: false };
      }
      if (isReadCountInvalid(count)) {
        console.error('count can not be more than limit');
        console.error('abort transaction');
        await session.abortTransaction();
        session.endSession();
        return { success: false };
      }
      if (offset === undefined && count === undefined) {
        data = await TowerFactory.instance().read(0, 100, {
          isPublic: true,
          $or: [
            { title: { '$regex': query, '$options': 'i' } },
            { description: { '$regex': query, '$options': 'i' } }
          ]
        });
      } else {
        data = await TowerFactory.instance().read(offset, count, {
          isPublic: true,
          $or: [
            { title: { '$regex': query, '$options': 'i' } },
            { description: { '$regex': query, '$options': 'i' } }
          ]
        });
      }
    }
    let towers = data;
    let contactUserIds = [];
    towers.forEach(tower => {
      if (tower.secret.isContact) {
        let user1Id = tower.secret.adminIds[0];
        let user2Id = tower.secret.adminIds[1];
        let target = (user1Id === userId) ? user2Id : user1Id;
        contactUserIds.push(target);
        tower.contactId = target;
      }
    });
    let people = await UserFactory.instance().findGroup({'id': { $in: contactUserIds}}, session);
    let peopleDict = {};
    people.forEach(person => {
      peopleDict[person.id] = person;
    });
    towers.forEach(tower => {
      if (tower.secret.isContact) {
        tower.contact = peopleDict[tower.contactId];
      }
    });
    await session.commitTransaction();
    session.endSession();
    return { success: true, towers: towers };
  } catch (error) {
    console.error(error);
    console.error('abort transaction');
    await session.abortTransaction();
    session.endSession();
    return { success: false };
  }
}
