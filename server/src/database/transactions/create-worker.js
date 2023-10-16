
const mongoose = require('mongoose');
let { Tower, Room, Bot, Worker } = require('../schemas/schemas');
let { isIdEmpty } = require('../../../../shared/utils/numbers');
const defaultAvatars = require('../../../../constants/avatars.json');

const checkImports = () => {
  if (Tower === undefined) {
    Tower = require('../schemas/schemas').Tower;
  }
  if (Room === undefined) {
    Room = require('../schemas/schemas').Room;
  }
  if (Worker === undefined) {
    Worker = require('../schemas/schemas').Worker;
  }
  if (Bot === undefined) {
    Bot = require('../schemas/schemas').Bot;
  }
}

module.exports.dbCreateWorker = async ({ botId }, userId, roomId) => {
  if (isIdEmpty(roomId)) {
    console.error('room id can not be empty');
    return { success: false };
  }
  if (isIdEmpty(botId)) {
    console.error('bot id can not be empty');
    return { success: false };
  }
  checkImports();
  const session = await mongoose.startSession();
  session.startTransaction();
  let worker;
  try {
    let success = false;
    let room = await Room.findOne({ id: roomId }).session(session).exec();
    if (room !== null) {
      let tower = await Tower.findOne({ id: room.towerId }).session(session).exec();
      if (tower.secret.adminIds.includes(user.id) || room.secret.adminIds.includes(user.id)) {
        let bot = await Bot.findOne({ id: botId }).session(session).exec();
        if (bot !== null) {
          worker = await Worker.create([{
            botId: botId,
            roomId: roomId,
            position: {
              x: 150,
              y: 150
            },
            size: {
              width: 150,
              height: 150
            }
          }], { session });
          worker = worker[0];
          await Worker.updateOne({ _id: worker._id }, { id: worker._id.toHexString() }).session(session);
          worker = await Worker.findOne({ id: worker.id }).session(session).exec();
          success = true;
          await session.commitTransaction();
        } else {
          console.error('bot not found');
          console.error('abort transaction');
          await session.abortTransaction();
        }
      } else {
        console.error('user is not admin of the tower or room');
        console.error('abort transaction');
        await session.abortTransaction();
      }
    } else {
      console.error('room does not exist');
      console.error('abort transaction');
      await session.abortTransaction();
    }
    session.endSession();
    if (success) {
      return { success: true, worker: worker };
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
