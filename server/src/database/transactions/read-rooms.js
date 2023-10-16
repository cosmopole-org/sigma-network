
const mongoose = require('mongoose');
const { isReadCountEmpty, isReadCountInvalid } = require('../../../../shared/utils/numbers');
let { Room, Member, Tower } = require('../schemas/schemas');
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
  if (Tower === undefined) {
    Tower = require('../schemas/schemas').Tower;
  }
  if (Room === undefined) {
    Room = require('../schemas/schemas').Room;
  }
}

module.exports.dbReadRooms = async ({ query, offset, count, towerId }, userId) => {
  checkImports();
  const session = await mongoose.startSession();
  session.startTransaction();
  let data;
  try {
    let success = false;
    let tower = await TowerFactory.instance().find({ id: towerId }, session);
    if (tower !== null) {
      if (tower.isPublic !== true) {
        if (isReadCountEmpty(count)) {
          console.error('count can not be empty');
          console.error('abort transaction');
          await session.abortTransaction();
          session.endSession();
          return { success: false };
        }
        if (isReadCountInvalid(count)) {
          console.error('count can not be more than 100');
          console.error('abort transaction');
          await session.abortTransaction();
          session.endSession();
          return { success: false };
        }
        let memberships = await MemberFactory.instance().findGroup({ userId: userId, towerId: towerId }, session);
        let memberedRoomIds = memberships.map(m => m.roomId);
        data = await RoomFactory.instance().read(offset, count, {
          towerId: towerId,
          $or: [
            {
              isPublic: true,
            },
            {
              isPublic: false,
              id: { $in: memberedRoomIds }
            }
          ],
          $or: [
            {
              title: { '$regex': query, '$options': 'i' },
            },
            {
              description: { '$regex': query, '$options': 'i' },
            }
          ]
        });
      } else {
        if (isReadCountEmpty(count)) {
          console.error('count can not be empty');
          console.error('abort transaction');
          await session.abortTransaction();
          session.endSession();
          return { success: false };
        }
        if (isReadCountInvalid(count)) {
          console.error('count can not be more than 100');
          console.error('abort transaction');
          await session.abortTransaction();
          session.endSession();
          return { success: false };
        }
        let memberships = await MemberFactory.instance().findGroup({ userId: userId, towerId: towerId }, session);
        let memberedRoomIds = memberships.map(m => m.roomId);
        data = await RoomFactory.instance().read(offset, count, {
          towerId: towerId,
          $or: [
            {
              isPublic: true,
            },
            {
              isPublic: false,
              id: { $in: memberedRoomIds }
            }
          ],
          $or: [
            { title: { '$regex': query, '$options': 'i' } },
            { description: { '$regex': query, '$options': 'i' } }
          ]
        });
        await session.commitTransaction();
        success = true;
      }
    } else {
      console.error('tower does not exist');
      console.error('abort transaction');
      await session.abortTransaction();
    }
    session.endSession();
    if (success) {
      return { success: true, rooms: data };
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
