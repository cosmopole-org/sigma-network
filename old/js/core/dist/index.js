var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// index.ts
var core_exports = {};
__export(core_exports, {
  Action: () => action_default,
  BaseMachine: () => base_machine_default,
  Client: () => client_default,
  Sigma: () => sigma_default,
  Update: () => base_default,
  Updater: () => Updater
});
module.exports = __toCommonJS(core_exports);

// database/factories/human.factory.ts
var import_mongoose2 = __toESM(require("mongoose"));

// database/schema/human.schema.ts
var import_mongoose = __toESM(require("mongoose"));
var HumanSchema = new import_mongoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  secret: import_mongoose.Schema.Types.Mixed
});
var Human;
var prepare = () => {
  Human = import_mongoose.default.model("Human", HumanSchema, "Human");
};

// database/factories/human.factory.ts
var HumanFactory = class _HumanFactory {
  static initialize() {
    return new _HumanFactory();
  }
  static get instance() {
    return _HumanFactory._instnace;
  }
  constructor() {
    _HumanFactory._instnace = this;
  }
  create(initData, session) {
    return __async(this, null, function* () {
      return (yield Human.create([initData], { session }))[0].toObject();
    });
  }
  read(offset, count, query) {
    return __async(this, null, function* () {
      let cursor;
      let collection = import_mongoose2.default.connection.db.collection("Human");
      if (offset && count) {
        if ((yield collection.count()) - offset >= 0) {
          cursor = collection.find(query ? query : {}).skip(offset).limit(count);
        } else {
          cursor = collection.find(query ? query : {}).skip(0).limit(count);
        }
      } else {
        cursor = collection.find(query ? query : {});
      }
      return yield cursor.toArray();
    });
  }
  find(query, session) {
    return __async(this, null, function* () {
      if (session) {
        return yield Human.findOne(query).session(session).lean().exec();
      } else {
        return yield Human.findOne(query).lean().exec();
      }
    });
  }
  findGroup(query, session) {
    return __async(this, null, function* () {
      if (session) {
        return yield Human.find(query).session(session).lean().exec();
      } else {
        return yield Human.find(query).lean().exec();
      }
    });
  }
  update(query, update7, session) {
    return __async(this, null, function* () {
      if (session) {
        return yield Human.findOneAndUpdate(query, update7, { new: true }).session(session).lean().exec();
      } else {
        return yield Human.findOneAndUpdate(query, update7, { new: true }).lean();
      }
    });
  }
  remove(query, session) {
    return __async(this, null, function* () {
      yield Human.deleteOne(query).session(session);
    });
  }
};
var human_factory_default = HumanFactory;

// database/factories/tower.factory.ts
var import_mongoose4 = __toESM(require("mongoose"));

// database/schema/tower.schema.ts
var import_mongoose3 = __toESM(require("mongoose"));
var TowerSchema = new import_mongoose3.Schema({
  id: String,
  title: String,
  avatarId: String,
  isPublic: Boolean,
  secret: import_mongoose3.Schema.Types.Mixed
});
var Tower;
var prepare2 = () => {
  Tower = import_mongoose3.default.model("Tower", TowerSchema, "Tower");
};

// database/factories/tower.factory.ts
var TowerFactory = class _TowerFactory {
  static initialize() {
    return new _TowerFactory();
  }
  static get instance() {
    return _TowerFactory._instance;
  }
  constructor() {
    _TowerFactory._instance = this;
  }
  create(initData, session) {
    return __async(this, null, function* () {
      return (yield Tower.create([initData], { session }))[0].toObject();
    });
  }
  read(offset, count, query) {
    return __async(this, null, function* () {
      let cursor;
      let collection = import_mongoose4.default.connection.db.collection("Tower");
      if ((yield collection.count()) - offset >= 0) {
        cursor = collection.find(query ? query : {}).skip(offset).limit(count);
      } else {
        cursor = collection.find(query ? query : {}).skip(0).limit(count);
      }
      return yield cursor.toArray();
    });
  }
  find(query, session) {
    return __async(this, null, function* () {
      return yield Tower.findOne(query).session(session).lean().exec();
    });
  }
  findGroup(query, session) {
    return __async(this, null, function* () {
      if (session) {
        return yield Tower.find(query).session(session).lean().exec();
      } else {
        return yield Tower.find(query).lean().exec();
      }
    });
  }
  update(query, update7, session) {
    return __async(this, null, function* () {
      return yield Tower.findOneAndUpdate(query, update7, { new: true }).session(session).lean();
    });
  }
  remove(query, session) {
    return __async(this, null, function* () {
      yield Tower.deleteOne(query).session(session);
    });
  }
};
var tower_factory_default = TowerFactory;

// database/factories/room.factory.ts
var import_mongoose6 = __toESM(require("mongoose"));

// database/schema/room.schema.ts
var import_mongoose5 = __toESM(require("mongoose"));
var RoomSchema = new import_mongoose5.Schema({
  id: String,
  title: String,
  avatarId: String,
  towerId: String,
  floor: String,
  isPublic: Boolean,
  secret: import_mongoose5.Schema.Types.Mixed
});
var Room;
var prepare3 = () => {
  Room = import_mongoose5.default.model("Room", RoomSchema, "Room");
};

// database/factories/room.factory.ts
var RoomFactory = class _RoomFactory {
  static initialize() {
    return new _RoomFactory();
  }
  static get instance() {
    return _RoomFactory._instance;
  }
  constructor() {
    _RoomFactory._instance = this;
  }
  create(initData, session) {
    return __async(this, null, function* () {
      return (yield Room.create([initData], { session }))[0].toObject();
    });
  }
  read(offset, count, query) {
    return __async(this, null, function* () {
      let cursor;
      let collection = import_mongoose6.default.connection.db.collection("Room");
      if ((yield collection.count()) - offset >= 0) {
        cursor = collection.find(query ? query : {}).skip(offset).limit(count);
      } else {
        cursor = collection.find(query ? query : {}).skip(0).limit(count);
      }
      return yield cursor.toArray();
    });
  }
  find(query, session) {
    return __async(this, null, function* () {
      return yield Room.findOne(query).session(session).lean().exec();
    });
  }
  findGroup(query, session) {
    return __async(this, null, function* () {
      if (session) {
        return yield Room.find(query).session(session).lean().exec();
      } else {
        return yield Room.find(query).lean().exec();
      }
    });
  }
  update(query, update7, session) {
    return __async(this, null, function* () {
      return yield Room.findOneAndUpdate(query, update7, { new: true }).session(session).lean();
    });
  }
  remove(query, session) {
    return __async(this, null, function* () {
      yield Room.deleteOne(query).session(session);
    });
  }
};
var room_factory_default = RoomFactory;

// database/factories/session.factory.ts
var import_mongoose8 = __toESM(require("mongoose"));

// database/schema/session.schema.ts
var import_mongoose7 = __toESM(require("mongoose"));
var SessionSchema = new import_mongoose7.Schema({
  id: String,
  token: String,
  humanId: String
});
var Session;
var prepare4 = () => {
  Session = import_mongoose7.default.model("Session", SessionSchema, "Session");
};

// database/factories/session.factory.ts
var SessionFactory = class _SessionFactory {
  static initialize() {
    return new _SessionFactory();
  }
  static get instance() {
    return _SessionFactory._instance;
  }
  constructor() {
    _SessionFactory._instance = this;
  }
  create(initData, session) {
    return __async(this, null, function* () {
      return (yield Session.create([initData], { session }))[0].toObject();
    });
  }
  read(offset, count, query) {
    return __async(this, null, function* () {
      let cursor;
      let collection = import_mongoose8.default.connection.db.collection("Session");
      if (offset && count && query) {
        if ((yield collection.count()) - offset >= 0) {
          if (query) {
            cursor = collection.find(query).skip(offset).limit(count);
          } else {
            cursor = collection.find({}).skip(offset).limit(count);
          }
        } else {
          if (query) {
            cursor = collection.find(query).skip(0).limit(count);
          } else {
            cursor = collection.find({}).skip(0).limit(count);
          }
        }
      } else {
        cursor = collection.find({});
      }
      return yield cursor.toArray();
    });
  }
  find(query, session) {
    return __async(this, null, function* () {
      return yield Session.findOne(query).session(session).lean().exec();
    });
  }
  findGroup(query, session) {
    return __async(this, null, function* () {
      return yield Session.find(query).session(session).lean().exec();
    });
  }
  update(query, update7, session) {
    return __async(this, null, function* () {
      yield Session.findOneAndUpdate(query, update7, { new: true }).session(session).lean();
    });
  }
  remove(query, session) {
    return __async(this, null, function* () {
      yield Session.deleteOne(query).session(session);
    });
  }
};
var session_factory_default = SessionFactory;

// database/factories/member.factory.ts
var import_mongoose10 = __toESM(require("mongoose"));

// database/schema/member.schema.ts
var import_mongoose9 = __toESM(require("mongoose"));
var MemberSchema = new import_mongoose9.Schema({
  id: String,
  humanId: String,
  towerId: String,
  secret: import_mongoose9.Schema.Types.Mixed
});
var Member;
var prepare5 = () => {
  Member = import_mongoose9.default.model("Member", MemberSchema, "Member");
};

// database/factories/member.factory.ts
var MemberFactory = class _MemberFactory {
  static initialize() {
    return new _MemberFactory();
  }
  static get instance() {
    return _MemberFactory._instance;
  }
  constructor() {
    _MemberFactory._instance = this;
  }
  create(initData, session) {
    return __async(this, null, function* () {
      return (yield Member.create([initData], { session }))[0].toObject();
    });
  }
  read(query, offset, count) {
    return __async(this, null, function* () {
      let cursor;
      let collection = import_mongoose10.default.connection.db.collection("Member");
      if (offset && count && query) {
        if ((yield collection.count()) - offset >= 0) {
          cursor = collection.find(query ? query : {}).skip(offset).limit(count);
        } else {
          cursor = collection.find(query ? query : {}).skip(0).limit(count);
        }
        return yield cursor.toArray();
      } else {
        cursor = collection.find({});
      }
      return yield cursor.toArray();
    });
  }
  find(query, session) {
    return __async(this, null, function* () {
      return yield Member.findOne(query).session(session).lean().exec();
    });
  }
  findGroup(query, session) {
    return __async(this, null, function* () {
      if (session) {
        return yield Member.find(query).session(session).lean().exec();
      } else {
        return yield Member.find(query).lean().exec();
      }
    });
  }
  update(query, update7, session) {
    return __async(this, null, function* () {
      return yield Member.findOneAndUpdate(query, update7, { new: true }).session(session).lean();
    });
  }
  remove(query, session) {
    return __async(this, null, function* () {
      yield Member.deleteOne(query).session(session);
    });
  }
};
var member_factory_default = MemberFactory;

// database/factories/pending.factory.ts
var import_mongoose12 = __toESM(require("mongoose"));

// database/schema/pending.schema.ts
var import_mongoose11 = __toESM(require("mongoose"));
var PendingSchema = new import_mongoose11.Schema({
  cCode: { type: String, required: true },
  vCode: { type: String, required: true },
  email: { type: String, required: true },
  humanId: { type: String },
  progress: { type: String, required: true }
});
var Pending;
var prepare6 = () => {
  Pending = import_mongoose11.default.model("Pending", PendingSchema, "Pending");
};

// database/factories/pending.factory.ts
var PendingFactory = class _PendingFactory {
  static initialize() {
    return new _PendingFactory();
  }
  static get instance() {
    return _PendingFactory._instance;
  }
  constructor() {
    _PendingFactory._instance = this;
  }
  create(initData, session) {
    return __async(this, null, function* () {
      return (yield Pending.create([initData], { session }))[0].toObject();
    });
  }
  read(offset, count, query) {
    return __async(this, null, function* () {
      let cursor;
      let collection = import_mongoose12.default.connection.db.collection("Pending");
      if ((yield collection.count()) - offset >= 0) {
        cursor = collection.find(query ? query : {}).skip(offset).limit(count);
      } else {
        cursor = collection.find(query ? query : {}).skip(0).limit(count);
      }
      return yield cursor.toArray();
    });
  }
  find(query, session) {
    return __async(this, null, function* () {
      return yield Pending.findOne(query).session(session).lean().exec();
    });
  }
  findGroup(query, session) {
    return __async(this, null, function* () {
      return yield Pending.find(query).session(session).lean().exec();
    });
  }
  update(query, update7, session) {
    return __async(this, null, function* () {
      return yield Pending.findOneAndUpdate(query, update7, { new: true }).session(session).lean();
    });
  }
  remove(query, session) {
    return __async(this, null, function* () {
      yield Pending.deleteOne(query).session(session);
    });
  }
};
var pending_factory_default = PendingFactory;

// database/factories/invite.factory.ts
var import_mongoose14 = __toESM(require("mongoose"));

// database/schema/invite.schema.ts
var import_mongoose13 = __toESM(require("mongoose"));
var InviteSchema = new import_mongoose13.Schema({
  id: String,
  humanId: String,
  towerId: String
});
var Invite;
var prepare7 = () => {
  Invite = import_mongoose13.default.model("Invite", InviteSchema, "Invite");
};

// database/factories/invite.factory.ts
var InviteFactory = class _InviteFactory {
  static initialize() {
    return new _InviteFactory();
  }
  static get instance() {
    return _InviteFactory._instance;
  }
  constructor() {
    _InviteFactory._instance = this;
  }
  create(initData, session) {
    return __async(this, null, function* () {
      return (yield Invite.create([initData], { session }))[0].toObject();
    });
  }
  read(query, offset, count) {
    return __async(this, null, function* () {
      let cursor;
      let collection = import_mongoose14.default.connection.db.collection("Invite");
      if (offset && count) {
        if ((yield collection.count()) - offset >= 0) {
          cursor = collection.find(query ? query : {}).skip(offset).limit(count);
        } else {
          cursor = collection.find(query ? query : {}).skip(0).limit(count);
        }
      } else {
        cursor = collection.find(query ? query : {});
      }
      return yield cursor.toArray();
    });
  }
  find(query, session) {
    return __async(this, null, function* () {
      if (session) {
        return yield Invite.findOne(query).session(session).lean().exec();
      } else {
        return yield Invite.findOne(query).lean().exec();
      }
    });
  }
  findGroup(query, session) {
    return __async(this, null, function* () {
      return yield Invite.find(query).session(session).lean().exec();
    });
  }
  update(query, update7, session) {
    return __async(this, null, function* () {
      return yield Invite.findOneAndUpdate(query, update7, { new: true }).session(session).lean();
    });
  }
  remove(query, session) {
    return __async(this, null, function* () {
      yield Invite.deleteOne(query).session(session);
    });
  }
};
var invite_factory_default = InviteFactory;

// database/drivers/main-driver.ts
var import_mongoose15 = require("mongoose");

// config.ts
var config = {
  TEMP_STORAGE: ""
};
var setupConfig = (conf) => {
  for (let key in conf) {
    config[key] = conf[key];
  }
};
var config_default = config;

// database/drivers/main-driver.ts
var connectMongoClient = () => __async(void 0, null, function* () {
  yield (0, import_mongoose15.connect)(config_default["MONGODB_URI"]);
});

// database/schema/bot.schema.ts
var import_mongoose16 = __toESM(require("mongoose"));
var BotSchema = new import_mongoose16.Schema({
  id: String,
  title: String,
  avatarId: String,
  secret: import_mongoose16.Schema.Types.Mixed
});
var Bot;
var prepare8 = () => {
  Bot = import_mongoose16.default.model("Bot", BotSchema, "Bot");
};

// database/schema/worker.schema.ts
var import_mongoose17 = __toESM(require("mongoose"));
var WorkerSchema = new import_mongoose17.Schema({
  id: String,
  machineId: String,
  roomId: String,
  secret: import_mongoose17.Schema.Types.Mixed
});
var Worker;
var prepare9 = () => {
  Worker = import_mongoose17.default.model("Worker", WorkerSchema, "Worker");
};

// database/schema/machine.schema.ts
var import_mongoose18 = __toESM(require("mongoose"));
var MachineSchema = new import_mongoose18.Schema({
  id: String,
  name: String,
  secret: import_mongoose18.Schema.Types.Mixed
});
var Machine;
var prepare10 = () => {
  Machine = import_mongoose18.default.model("Machine", MachineSchema, "Machine");
};

// database/schema/index.ts
var build = () => {
  prepare6();
  prepare4();
  prepare();
  prepare8();
  prepare7();
  prepare5();
  prepare3();
  prepare2();
  prepare10();
  prepare9();
};

// database/factories/machine.factory.ts
var import_mongoose19 = __toESM(require("mongoose"));
var MachineFactory = class _MachineFactory {
  static initialize() {
    return new _MachineFactory();
  }
  static get instance() {
    return _MachineFactory._instance;
  }
  constructor() {
    _MachineFactory._instance = this;
  }
  create(initData, session) {
    return __async(this, null, function* () {
      return (yield Machine.create([initData], { session }))[0].toObject();
    });
  }
  read(offset, count, query) {
    return __async(this, null, function* () {
      let cursor;
      let collection = import_mongoose19.default.connection.db.collection("Machine");
      if ((yield collection.count()) - offset >= 0) {
        cursor = collection.find(query ? query : {}).skip(offset).limit(count);
      } else {
        cursor = collection.find(query ? query : {}).skip(0).limit(count);
      }
      return yield cursor.toArray();
    });
  }
  find(query, session) {
    return __async(this, null, function* () {
      return yield Machine.findOne(query).session(session).lean().exec();
    });
  }
  findGroup(query, session) {
    return __async(this, null, function* () {
      return yield Machine.find(query).session(session).lean().exec();
    });
  }
  update(query, update7, session) {
    return __async(this, null, function* () {
      return yield Machine.findOneAndUpdate(query, update7, { new: true }).session(session).lean();
    });
  }
  remove(query, session) {
    return __async(this, null, function* () {
      yield Machine.deleteOne(query).session(session);
    });
  }
};
var machine_factory_default = MachineFactory;

// database/factories/worker.factory.ts
var import_mongoose20 = __toESM(require("mongoose"));
var WorkerFactory = class _WorkerFactory {
  static initialize() {
    return new _WorkerFactory();
  }
  static get instance() {
    return _WorkerFactory._instance;
  }
  constructor() {
    _WorkerFactory._instance = this;
  }
  create(initData, session) {
    return __async(this, null, function* () {
      return (yield Worker.create([initData], { session }))[0].toObject();
    });
  }
  update(query, update7, session) {
    return __async(this, null, function* () {
      return Worker.findOneAndUpdate(query, update7, { new: true }).session(session).lean();
    });
  }
  replace(query, newOne, session) {
    return __async(this, null, function* () {
      return Worker.findOneAndReplace(query, newOne, { new: true }).session(session).lean();
    });
  }
  read(query) {
    return __async(this, null, function* () {
      let cursor;
      let collection = import_mongoose20.default.connection.db.collection("Worker");
      cursor = collection.find(query);
      return yield cursor.toArray();
    });
  }
  find(query, session) {
    return __async(this, null, function* () {
      return Worker.findOne(query).session(session).lean().exec();
    });
  }
  remove(query, session) {
    return __async(this, null, function* () {
      yield Worker.deleteOne(query).session(session);
    });
  }
};
var worker_factory_default = WorkerFactory;

// database/index.ts
var StorageDriver = class _StorageDriver {
  static get instance() {
    return _StorageDriver._instancce;
  }
  static initialize(callback) {
    return new _StorageDriver(callback);
  }
  constructor(callback) {
    _StorageDriver._instancce = this;
    connectMongoClient().then(() => {
      build();
      human_factory_default.initialize();
      tower_factory_default.initialize();
      room_factory_default.initialize();
      invite_factory_default.initialize();
      member_factory_default.initialize();
      pending_factory_default.initialize();
      session_factory_default.initialize();
      machine_factory_default.initialize();
      worker_factory_default.initialize();
      callback();
    });
  }
};
var database_default = StorageDriver;

// drivers/network/network.ts
var import_socket = require("socket.io");
var import_express = __toESM(require("express"));
var import_node_http = require("http");
var import_reflect_metadata = require("reflect-metadata");

// utils/json.ts
var safeStringify = (obj, indent = 2) => {
  let cache = [];
  const retVal = JSON.stringify(
    obj,
    (key, value) => typeof value === "object" && value !== null ? cache.includes(value) ? void 0 : cache.push(value) && value : value,
    indent
  );
  cache = null;
  return retVal;
};

// drivers/network/client.ts
var Client = class {
  reset() {
    this.updateToken(void 0);
    this.updateHumanId(void 0);
    this.updateTowerId(void 0, void 0);
  }
  updateToken(token) {
    this.token = token;
  }
  updateHumanId(humanId) {
    this.humanId = humanId;
  }
  updateTowerId(towerId, rights) {
    this.towerId = towerId;
    this.rights = rights;
  }
  emit(update7) {
    this.socket.emit("update", JSON.parse(safeStringify(update7)));
  }
  joinTower(towerId) {
    this.socket.join(towerId);
  }
  leaveTower(towerId) {
    this.socket.leave(towerId);
  }
  joinTowers(towerIds) {
    this.socket.join(towerIds);
  }
  leaveTowers(towerIds) {
    towerIds.forEach((towerId) => this.leaveTower(towerId));
  }
  constructor(socket, emitter) {
    this.socket = socket;
    this.emitter = emitter;
  }
};
var client_default = Client;

// drivers/network/network.ts
var import_redis_adapter = require("@socket.io/redis-adapter");

// drivers/memory/memory.ts
var redis = __toESM(require("redis"));
var MemoryDriver = class _MemoryDriver {
  static initialize() {
    return new _MemoryDriver();
  }
  static get instance() {
    return _MemoryDriver._instance;
  }
  save(key, value) {
    return __async(this, null, function* () {
      yield this.redisClient.set(key, JSON.stringify(value));
    });
  }
  remove(key) {
    return __async(this, null, function* () {
      yield this.redisClient.del(key);
    });
  }
  fetch(key) {
    return new Promise((resolve) => {
      this.redisClient.get(key).then(function(obj) {
        if (!obj) {
          console.log("key not found:", key);
          resolve(void 0);
          return;
        }
        resolve(JSON.parse(obj));
      });
    });
  }
  loadAuthIntoMemory() {
    session_factory_default.instance.read().then((ss) => {
      ss.forEach((s) => {
        this.save(`auth:${s.token}`, s.humanId);
      });
    });
    member_factory_default.instance.read().then((ms) => {
      ms.forEach((m) => {
        this.save(`rights:${m.towerId}/${m.humanId}`, JSON.stringify(m.secret.permissions));
      });
    });
  }
  constructor() {
    _MemoryDriver._instance = this;
    this.redisClient = redis.createClient({ url: config_default["REDIS_URI"] });
    this.redisClient.connect().then(() => __async(this, null, function* () {
      this.redisClient.on("error", function(err) {
        console.log("Could not establish a connection with redis. " + err);
      });
      this.redisClient.on("connect", function(err) {
        console.log("Connected to redis successfully");
      });
      this.loadAuthIntoMemory();
    }));
  }
};
var memory_default = MemoryDriver;

// drivers/network/network.ts
var import_redis_emitter = require("@socket.io/redis-emitter");

// controllers/base.controller.ts
var BaseController = class {
};
var base_controller_default = BaseController;

// controllers/custom.controller.ts
var CustomController = class extends base_controller_default {
  constructor(name, service) {
    super();
    this.name = name;
    this.service = service;
  }
  getName() {
    return this.name;
  }
  route(key, client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.route(key, client, body);
      response(result);
    });
  }
  routeRest(key, client, req, res) {
    return __async(this, null, function* () {
      yield this.service.routeRest(key, client, req, res);
    });
  }
};
var custom_controller_default = CustomController;

// drivers/network/network.ts
var import_cors = __toESM(require("cors"));
var NetworkDriver = class _NetworkDriver {
  constructor(callback) {
    this.controllers = {};
    this.services = {};
    this.clients = {};
    this.restSessions = {};
    this.lastSeens = {};
    _NetworkDriver._instance = this;
    human_factory_default.instance.read().then((humans) => {
      humans.forEach((human) => {
        this.lastSeens[human.id] = human.secret.lastSeen;
      });
      this.app = (0, import_express.default)();
      this.app.use((0, import_cors.default)());
      this.app.use(import_express.default.urlencoded({ extended: true }));
      this.app.use(import_express.default.json());
      this.server = (0, import_node_http.createServer)(this.app);
      this.io = new import_socket.Server(this.server, {
        cors: {
          origin: "*"
        },
        maxHttpBufferSize: 1e8
      });
      let subClient = memory_default.instance.redisClient.duplicate();
      this.io.adapter((0, import_redis_adapter.createAdapter)(memory_default.instance.redisClient, subClient));
      this.emitter = new import_redis_emitter.Emitter(memory_default.instance.redisClient);
      this.creaateWelcomeRoute();
      this.startExpressServer();
      this.io.on("connection", (socket) => {
        console.log("a client connected");
        let client = new client_default(socket, this.emitter);
        socket.on("disconnect", () => __async(this, null, function* () {
          console.log("client disconnected");
          delete this.clients[client.humanId];
          let humanId = client.humanId;
          if (humanId) {
            let controller = this.controllers["human"];
            let result = yield controller.service.signOut(client, "EMPTY");
            if (result.success) {
              this.lastSeens[humanId] = result.lastSeen;
            }
          }
        }));
        socket.onAny((...args) => {
          this.route(client, args[0], args[1], args[2], args[3]);
        });
      });
      this.app.all("*", (req, res, next) => {
        var _a;
        if (!this.routeRest(this.restSessions[(_a = req.headers["token"]) == null ? void 0 : _a.toString()], req.path.substring(1), req, res)) {
          next();
        }
      });
      callback();
    });
  }
  static get instance() {
    return _NetworkDriver._instance;
  }
  static initialize(callback) {
    return new _NetworkDriver(callback);
  }
  group(towerId) {
    return {
      emit: (packet) => {
        this.io.to(towerId).emit("update", JSON.parse(safeStringify(packet)));
      },
      boradcast: {
        emit: (client, packet) => {
          client.socket.broadcast.to(towerId).emit("update", JSON.parse(safeStringify(packet)));
        }
      }
    };
  }
  keepClient(token, client) {
    this.clients[client.humanId] = client;
    this.restSessions[token] = client;
  }
  looseClient(client) {
    client.token && delete this.restSessions[client.token];
    client.humanId && delete this.clients[client.humanId];
  }
  registerController(type, type2, meta) {
    let service = meta ? new type2(meta) : new type2();
    let controller = new type(service);
    this.services[controller.getName()] = service;
    this.controllers[controller.getName()] = controller;
  }
  registerCustomController(controller) {
    this.controllers[controller.getName()] = controller;
  }
  creaateWelcomeRoute() {
    this.app.get("/", (req, res) => {
      res.send("<h1>Welcome to Sigma !</h1>");
    });
  }
  startExpressServer() {
    this.server.listen(config_default["SOCKET_PORT"], () => {
      console.log(`server running at http://localhost:${config_default["SOCKET_PORT"]}`);
    });
  }
  route(client, path, body, requestId, callback) {
    let parts = path.split("/");
    let controller = this.controllers[parts[0]];
    if (controller instanceof custom_controller_default) {
      controller.route(parts.slice(1), client, body, requestId, callback).catch((ex) => console.log(ex));
    } else {
      controller[parts[1]](client, body, requestId, callback).catch((ex) => console.log(ex));
    }
  }
  routeRest(client, path, req, res) {
    console.log(path);
    let parts = path.split("/");
    let controller = this.controllers[parts[0]];
    if (controller instanceof custom_controller_default) {
      controller.routeRest(parts.slice(1), client, req, res).catch((ex) => console.log(ex));
      return true;
    } else {
      return false;
    }
  }
};
var network_default = NetworkDriver;

// database/transactions/human/index.ts
var human_exports = {};
__export(human_exports, {
  complete: () => complete_default,
  readById: () => readById_default,
  readGroupById: () => readGroupById_default,
  search: () => search_default,
  signIn: () => signIn_default,
  signOut: () => signOut_default,
  signUp: () => signUp_default,
  update: () => update_default,
  verify: () => verify_default
});

// database/transactions/human/signIn.ts
var signIn = (args, _session) => __async(void 0, null, function* () {
  yield human_factory_default.instance.update({ id: args.humanId }, { $set: { "secret.lastSeen": -1 } });
  let memberships = yield member_factory_default.instance.read({ humanId: args.humanId });
  return { success: true, memberships };
});
var signIn_default = signIn;

// database/transactions/human/signUp.ts
var import_mongoose21 = __toESM(require("mongoose"));

// utils/strings.ts
var isEmpty = (str) => {
  return str === void 0 || str === null || str.length === 0;
};
var isNameFieldInvalid = (str) => {
  if (str === void 0 || str === null)
    return true;
  return str.length > 64;
};

// utils/generator.ts
var crypto = __toESM(require("crypto"));
var makeUniqueId = () => {
  return crypto.randomBytes(16).toString("hex");
};

// database/transactions/human/signUp.ts
var signUp = (args, _session) => __async(void 0, null, function* () {
  if (isEmpty(args.email)) {
    console.error("email can not be empty");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose21.default.startSession();
  if (!_session)
    session.startTransaction();
  let pending;
  try {
    let success = false;
    pending = yield pending_factory_default.instance.find({ email: args.email }, session);
    let vCode = "123", cCode = makeUniqueId();
    if (pending === null) {
      pending = yield pending_factory_default.instance.create({
        email: args.email,
        cCode,
        vCode,
        progress: "registered"
      }, session);
      if (!_session)
        yield session.commitTransaction();
      success = true;
    } else {
      yield pending_factory_default.instance.update({ email: args.email }, { cCode, vCode, progress: "registered" }, session);
      if (!_session)
        yield session.commitTransaction();
      success = true;
    }
    if (!_session)
      session.endSession();
    if (success) {
      return { success: true, cCode };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var signUp_default = signUp;

// database/transactions/human/verify.ts
var import_mongoose22 = __toESM(require("mongoose"));
var verify = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose22.default.startSession();
  if (!_session)
    session.startTransaction();
  let pending, userSession, human;
  try {
    let handlePostAuth = () => __async(void 0, null, function* () {
      human = yield human_factory_default.instance.find({ id: pending.humanId }, session);
      if (human !== null) {
        userSession = yield session_factory_default.instance.create({
          id: makeUniqueId(),
          token: makeUniqueId(),
          humanId: human.id
        }, session);
        human = yield human_factory_default.instance.update({ id: human.id }, { $push: { sessionIds: userSession.id } }, session);
        let memberships = yield member_factory_default.instance.findGroup({ humanId: human.id }, session);
        let towers = yield tower_factory_default.instance.findGroup({ id: { $in: memberships.map((m) => m.towerId) } }, session);
        let rooms = yield room_factory_default.instance.findGroup({ towerId: { $in: memberships.map((m) => m.towerId) } }, session);
        if (!_session) {
          yield session.commitTransaction();
          session.endSession();
        }
        return {
          success: true,
          session: userSession,
          human,
          towers,
          rooms,
          memberships
        };
      } else {
        if (args.accessToken) {
          yield pending_factory_default.instance.update({ cCode: args.accessToken }, { progress: "verified" }, session);
        } else {
          yield pending_factory_default.instance.update({ cCode: args.cCode, vCode: args.vCode }, { progress: "verified" }, session);
        }
        if (!_session) {
          yield session.commitTransaction();
          session.endSession();
        }
        return { success: true };
      }
    });
    if (args.accessToken) {
      let d = Buffer.from(args.accessToken.split(".")[1], "base64").toString();
      const inputData = JSON.parse(d);
      let email = inputData[config_default["AUTH0_TOKEN_EMAIL_DECODER_KEY"]];
      pending = yield pending_factory_default.instance.find({ email }, session);
      if (pending !== null) {
        pending = yield pending_factory_default.instance.update({ email }, { progress: "verified", cCode: args.accessToken, vCode: args.accessToken }, session);
      } else {
        pending = yield pending_factory_default.instance.create({ progress: "verified", email, cCode: args.accessToken, vCode: args.accessToken }, session);
      }
      return yield handlePostAuth();
    } else {
      pending = yield pending_factory_default.instance.find({ vCode: args.vCode, cCode: args.cCode }, session);
      if (pending !== null) {
        return yield handlePostAuth();
      } else {
        if (!_session) {
          yield session.abortTransaction();
          session.endSession();
        }
        return { success: false };
      }
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var verify_default = verify;

// database/transactions/human/complete.ts
var import_mongoose23 = __toESM(require("mongoose"));

// permissions.json
var permissions_default = {
  DEFAULT_ROOM_MEMBER_PERMISSIONS: {},
  DEFAULT_ROOM_ADMIN_PERMISSIONS: {}
};

// database/transactions/human/complete.ts
var complete = (args, _session) => __async(void 0, null, function* () {
  if (isEmpty(args.firstName)) {
    console.error("first name can not be empty");
    return { success: false };
  }
  if (isNameFieldInvalid(args.firstName)) {
    console.error("name can not be longer than limit.");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose23.default.startSession();
  if (!_session)
    session.startTransaction();
  let pending, human, sess, tower, room, member;
  try {
    pending = yield pending_factory_default.instance.find({ cCode: args.cCode }, session);
    if ((pending == null ? void 0 : pending.progress) === "verified") {
      let userGenedId = makeUniqueId();
      sess = yield session_factory_default.instance.create({
        id: makeUniqueId(),
        token: makeUniqueId(),
        humanId: userGenedId
      }, session);
      let towerGenedId = makeUniqueId();
      let roomGenedId = makeUniqueId();
      human = yield human_factory_default.instance.create({
        id: userGenedId,
        firstName: args.firstName,
        lastName: args.lastName,
        secret: {
          email: pending.email,
          homeId: towerGenedId,
          sessionIds: [sess.id]
        }
      }, session);
      yield pending_factory_default.instance.update({ cCode: args.cCode }, { humanId: human.id }, session);
      tower = yield tower_factory_default.instance.create({
        id: towerGenedId,
        title: `${args.firstName}'s home`,
        avatarId: "EMPTY",
        isPublic: false,
        secret: {
          ownerId: human.id,
          adminIds: [
            userGenedId
          ]
        }
      }, session);
      room = yield room_factory_default.instance.create({
        id: roomGenedId,
        title: "hall",
        avatarId: "EMPTY",
        isPublic: false,
        floor: "hall",
        towerId: towerGenedId,
        secret: {
          adminIds: [
            userGenedId
          ]
        }
      }, session);
      args.creationCallback && (yield args.creationCallback(room, session));
      member = yield member_factory_default.instance.create({
        id: makeUniqueId(),
        humanId: human.id,
        towerId: tower.id,
        secret: {
          permissions: permissions_default.DEFAULT_ROOM_ADMIN_PERMISSIONS
        }
      }, session);
      if (!_session) {
        yield session.commitTransaction();
        session.endSession();
      }
      return {
        success: true,
        session: sess,
        human,
        tower,
        room,
        member
      };
    } else {
      if (!_session) {
        yield session.abortTransaction();
        session.endSession();
      }
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var complete_default = complete;

// database/transactions/human/readById.ts
var readById = (args, _session) => __async(void 0, null, function* () {
  try {
    let human = yield human_factory_default.instance.find({ id: args.targetHumanId });
    return { success: true, human };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
});
var readById_default = readById;

// database/transactions/human/search.ts
var search = (args, _session) => __async(void 0, null, function* () {
  try {
    let data = yield human_factory_default.instance.read(args.offset, args.count, {
      $or: [
        { firstName: { "$regex": args.query, "$options": "i" } },
        { lastName: { "$regex": args.query, "$options": "i" } }
      ]
    });
    return { success: true, humans: data };
  } catch (error) {
    return { success: false };
  }
});
var search_default = search;

// database/transactions/human/signOut.ts
var signOut = (args, _session) => __async(void 0, null, function* () {
  try {
    let lastSeen = Date.now();
    yield human_factory_default.instance.update({ id: args.humanId }, { $set: { "secret.lastSeen": lastSeen } });
    let memberships = yield member_factory_default.instance.read({ humanId: args.humanId });
    return { success: true, memberships, lastSeen };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
});
var signOut_default = signOut;

// database/transactions/human/readGroupById.ts
var readGroupById = (args, _session) => __async(void 0, null, function* () {
  try {
    let humans = yield human_factory_default.instance.findGroup({ id: { $in: args.targetHumanIds } });
    return { success: true, humans };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
});
var readGroupById_default = readGroupById;

// database/transactions/human/update.ts
var import_mongoose24 = __toESM(require("mongoose"));
var update = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose24.default.startSession();
  if (!_session)
    session.startTransaction();
  try {
    let human = yield human_factory_default.instance.find({ id: args.humanId }, session);
    if (human !== null) {
      human = yield human_factory_default.instance.update(
        {
          id: args.humanId
        },
        {
          firstName: args.firstName,
          lastName: args.lastName
        },
        session
      );
      if (!_session) {
        yield session.commitTransaction();
        session.endSession();
      }
      return {
        success: true,
        human
      };
    } else {
      if (!_session) {
        yield session.abortTransaction();
        session.endSession();
      }
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var update_default = update;

// database/transactions/tower/index.ts
var tower_exports = {};
__export(tower_exports, {
  addMember: () => addMember_default,
  create: () => create_default,
  join: () => join_default,
  read: () => read_default,
  readById: () => readById_default2,
  readMembers: () => readMembers_default,
  remove: () => remove_default,
  search: () => search_default2,
  update: () => update_default2
});

// database/transactions/tower/create.ts
var import_mongoose25 = __toESM(require("mongoose"));
var create = (args, _session) => __async(void 0, null, function* () {
  if (isEmpty(args.title)) {
    console.error("title can not be empty");
    return { success: false };
  }
  if (isNameFieldInvalid(args.title)) {
    console.error("title can not be longer than limit");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose25.default.startSession();
  if (!_session)
    session.startTransaction();
  let tower, room, member;
  try {
    tower = yield tower_factory_default.instance.create({
      id: makeUniqueId(),
      title: args.title,
      avatarId: isEmpty(args.avatarId) ? "EMPTY" : args.avatarId,
      isPublic: args.isPublic,
      secret: {
        ownerId: args.ownerId,
        adminIds: [
          args.ownerId
        ]
      }
    }, session);
    room = yield room_factory_default.instance.create({
      id: makeUniqueId(),
      title: "hall",
      avatarId: "EMPTY",
      floor: "hall",
      isPublic: args.isPublic,
      towerId: tower.id,
      secret: {
        adminIds: [
          args.ownerId
        ]
      }
    }, session);
    args.creationCallback && (yield args.creationCallback(room, session));
    member = yield member_factory_default.instance.create({
      id: makeUniqueId(),
      humanId: args.ownerId,
      towerId: tower.id,
      secret: {
        permissions: permissions_default.DEFAULT_ROOM_ADMIN_PERMISSIONS
      }
    }, session);
    if (!_session) {
      yield session.commitTransaction();
      session.endSession();
    }
    return { success: true, tower, room, member };
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var create_default = create;

// database/transactions/tower/update.ts
var import_mongoose26 = __toESM(require("mongoose"));
var update2 = (args, _session) => __async(void 0, null, function* () {
  if (isEmpty(args.title)) {
    console.error("title can not be empty");
    return { success: false };
  }
  if (isNameFieldInvalid(args.title)) {
    console.error("title can not be longer than limit");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose26.default.startSession();
  if (!_session)
    session.startTransaction();
  try {
    let success = false;
    let tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if (tower.secret.adminIds.includes(args.humanId)) {
        tower = yield tower_factory_default.instance.update({ id: tower.id }, {
          title: args.title,
          avatarId: isEmpty(args.avatarId) ? "EMPTY" : args.avatarId,
          isPublic: args.isPublic
        }, session);
        success = true;
        if (!_session)
          yield session.commitTransaction();
      } else {
        console.error("user is not admin of the tower");
        console.error("abort transaction");
        if (!_session)
          yield session.abortTransaction();
      }
    } else {
      console.error("tower does not exist");
      console.error("abort transaction");
      if (!_session)
        yield session.abortTransaction();
    }
    if (!_session)
      session.endSession();
    if (success) {
      return { success: true, tower };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var update_default2 = update2;

// database/transactions/tower/remove.ts
var import_mongoose27 = __toESM(require("mongoose"));
var remove = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose27.default.startSession();
  if (!_session)
    session.startTransaction();
  try {
    let memberIds;
    let success = false;
    let tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if (tower.secret.adminIds.includes(args.humanId)) {
        memberIds = (yield member_factory_default.instance.findGroup({ towerId: args.towerId }, session)).map((m) => m.humanId);
        yield tower_factory_default.instance.remove({ id: tower.id }, session);
        success = true;
        if (!_session)
          yield session.commitTransaction();
      } else {
        console.error("user is not admin of the tower");
        console.error("abort transaction");
        if (!_session)
          yield session.abortTransaction();
      }
    } else {
      console.error("tower does not exist");
      console.error("abort transaction");
      if (!_session)
        yield session.abortTransaction();
    }
    if (!_session)
      session.endSession();
    if (success) {
      return { success: true, tower, memberIds };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var remove_default = remove;

// database/transactions/tower/search.ts
var import_mongoose28 = __toESM(require("mongoose"));
var search2 = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose28.default.startSession();
  if (!_session)
    session.startTransaction();
  let data;
  try {
    if (args.mine) {
      let members = yield member_factory_default.instance.findGroup({ userId: args.humanId }, session);
      if (args.offset === void 0 && args.count === void 0) {
        data = yield tower_factory_default.instance.read(0, 100, {
          $or: [
            { title: { "$regex": args.query, "$options": "i" }, id: { $in: members.map((m) => m.towerId) } },
            { description: { "$regex": args.query, "$options": "i" }, id: { $in: members.map((m) => m.towerId) } }
          ]
        });
      } else {
        data = yield tower_factory_default.instance.read(args.offset, args.count, {
          $or: [
            { title: { "$regex": args.query, "$options": "i" }, id: { $in: members.map((m) => m.towerId) } },
            { description: { "$regex": args.query, "$options": "i" }, id: { $in: members.map((m) => m.towerId) } }
          ]
        });
      }
    } else {
      if (args.offset === void 0 && args.count === void 0) {
        data = yield tower_factory_default.instance.read(0, 100, {
          isPublic: true,
          $or: [
            { title: { "$regex": args.query, "$options": "i" } },
            { description: { "$regex": args.query, "$options": "i" } }
          ]
        });
      } else {
        data = yield tower_factory_default.instance.read(args.offset, args.count, {
          isPublic: true,
          $or: [
            { title: { "$regex": args.query, "$options": "i" } },
            { description: { "$regex": args.query, "$options": "i" } }
          ]
        });
      }
    }
    if (!_session) {
      yield session.commitTransaction();
      session.endSession();
    }
    return { success: true, towers: data };
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var search_default2 = search2;

// database/transactions/tower/join.ts
var import_mongoose29 = __toESM(require("mongoose"));

// utils/numbers.ts
var isIdEmpty = (id) => {
  return id === void 0 || id === null || id.length === 0;
};

// database/transactions/tower/join.ts
var join = (args, _session) => __async(void 0, null, function* () {
  if (isIdEmpty(args.towerId)) {
    console.error("tower id can not be empty");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose29.default.startSession();
  if (!_session)
    session.startTransaction();
  let member, tower;
  try {
    tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
    if (tower.isPublic) {
      member = yield member_factory_default.instance.find({ humanId: args.requesterId, towerId: args.towerId }, session);
      if (member === null) {
        member = yield member_factory_default.instance.create({
          id: makeUniqueId(),
          humanId: args.requesterId,
          towerId: args.towerId,
          secret: {
            permissions: permissions_default.DEFAULT_ROOM_ADMIN_PERMISSIONS
          }
        }, session);
        if (!_session) {
          yield session.commitTransaction();
          session.endSession();
        }
        return {
          success: true,
          member
        };
      } else {
        console.log("you are already a member of this tower.");
        if (!_session) {
          console.error("abort transaction");
          yield session.abortTransaction();
          session.endSession();
        }
        return { success: false };
      }
    } else {
      if (!_session) {
        console.error("abort transaction");
        yield session.abortTransaction();
        session.endSession();
      }
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error("abort transaction");
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var join_default = join;

// database/transactions/tower/readById.ts
var import_mongoose30 = __toESM(require("mongoose"));
var readById2 = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose30.default.startSession();
  if (!_session)
    session.startTransaction();
  let tower, rooms;
  try {
    let success = false;
    tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if (tower.isPublic) {
        success = true;
      } else {
        if (args.humanId) {
          let member = yield member_factory_default.instance.find({ humanId: args.humanId, towerId: args.towerId }, session);
          success = member !== null;
        }
      }
    }
    if (success) {
      rooms = yield room_factory_default.instance.findGroup({ towerId: tower.id }, session);
    }
    if (!_session) {
      yield session.commitTransaction();
      session.endSession();
    }
    if (success) {
      return { success: true, tower, rooms };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var readById_default2 = readById2;

// database/transactions/tower/readMembers.ts
var import_mongoose31 = __toESM(require("mongoose"));
var readMembers = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose31.default.startSession();
  if (!_session)
    session.startTransaction();
  let result;
  try {
    let success = false;
    let myMembership = yield member_factory_default.instance.find({ towerId: args.towerId, humanId: args.humanId }, session);
    if (myMembership !== null) {
      let data = yield member_factory_default.instance.findGroup({ towerId: args.towerId }, session);
      let humans = yield human_factory_default.instance.findGroup({ id: { $in: data.map((m) => m.humanId) } });
      let humansDict = {};
      humans.forEach((human) => {
        humansDict[human.id] = human;
      });
      result = data.map((m) => __spreadProps(__spreadValues({}, m), { human: humansDict[m.humanId] }));
      success = true;
    }
    if (!_session) {
      yield session.commitTransaction();
      session.endSession();
    }
    if (success) {
      return { success: true, members: result };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var readMembers_default = readMembers;

// database/transactions/tower/read.ts
var import_mongoose32 = __toESM(require("mongoose"));
var read = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose32.default.startSession();
  if (!_session)
    session.startTransaction();
  let towers, rooms;
  try {
    let members = yield member_factory_default.instance.findGroup({ humanId: args.humanId }, session);
    towers = yield tower_factory_default.instance.findGroup({ id: { $in: members.map((m) => m.towerId) } }, session);
    rooms = yield room_factory_default.instance.findGroup({ towerId: { $in: towers.map((t) => t.id) } }, session);
    if (!_session) {
      yield session.commitTransaction();
      session.endSession();
    }
    return { success: true, towers, rooms };
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var read_default = read;

// database/transactions/tower/addMember.ts
var import_mongoose33 = __toESM(require("mongoose"));
var addMember = (args, _session) => __async(void 0, null, function* () {
  if (isIdEmpty(args.towerId)) {
    console.error("tower id can not be empty");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose33.default.startSession();
  if (!_session)
    session.startTransaction();
  let member, tower;
  try {
    tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
    member = yield member_factory_default.instance.create({
      id: makeUniqueId(),
      humanId: args.humanId,
      towerId: args.towerId,
      secret: {
        permissions: permissions_default.DEFAULT_ROOM_ADMIN_PERMISSIONS
      }
    }, session);
    if (!_session) {
      yield session.commitTransaction();
      session.endSession();
    }
    return {
      success: true,
      member
    };
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error("abort transaction");
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var addMember_default = addMember;

// database/transactions/room/index.ts
var room_exports = {};
__export(room_exports, {
  create: () => create_default2,
  readById: () => readById_default3,
  remove: () => remove_default2,
  search: () => search_default3,
  update: () => update_default3
});

// database/transactions/room/create.ts
var import_mongoose34 = __toESM(require("mongoose"));
var create2 = (args, _session) => __async(void 0, null, function* () {
  if (isEmpty(args.title)) {
    console.error("title can not be empty");
    return { success: false };
  }
  if (isNameFieldInvalid(args.title)) {
    console.error("title can not be longer than limit");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose34.default.startSession();
  if (!_session)
    session.startTransaction();
  let room;
  try {
    let success = false;
    let tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if (tower.secret.adminIds.includes(args.humanId)) {
        room = yield room_factory_default.instance.create({
          id: makeUniqueId(),
          title: args.title,
          avatarId: isEmpty(args.avatarId) ? "EMPTY" : args.avatarId,
          towerId: args.towerId,
          isPublic: args.isPublic,
          floor: args.floor,
          secret: {
            adminIds: [
              args.humanId
            ]
          }
        }, session);
        args.creationCallback && (yield args.creationCallback(room, session));
        success = true;
        if (!_session)
          yield session.commitTransaction();
      } else {
        console.error("user is not admin of the tower");
        console.error("abort transaction");
        if (!_session)
          yield session.abortTransaction();
      }
    } else {
      console.error("tower does not exist");
      console.error("abort transaction");
      if (!_session)
        yield session.abortTransaction();
    }
    if (!_session)
      session.endSession();
    if (success) {
      return {
        success: true,
        room
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var create_default2 = create2;

// database/transactions/room/remove.ts
var import_mongoose35 = __toESM(require("mongoose"));
var remove2 = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose35.default.startSession();
  if (!_session)
    session.startTransaction();
  let room;
  try {
    let success = false;
    let tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      room = yield room_factory_default.instance.find({ id: args.roomId, towerId: args.towerId }, session);
      if (tower.secret.adminIds.includes(args.humanId) || room.secret.adminIds.includes(args.humanId)) {
        yield room_factory_default.instance.remove({ id: args.roomId }, session);
        success = true;
        if (!_session)
          yield session.commitTransaction();
      } else {
        console.error("user is not admin of the tower or room");
        console.error("abort transaction");
        if (!_session)
          yield session.abortTransaction();
      }
    } else {
      console.error("tower does not exist");
      console.error("abort transaction");
      if (!_session)
        yield session.abortTransaction();
    }
    if (!_session)
      session.endSession();
    if (success) {
      return { success: true, room };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var remove_default2 = remove2;

// database/transactions/room/search.ts
var import_mongoose36 = __toESM(require("mongoose"));
var search3 = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose36.default.startSession();
  if (!_session)
    session.startTransaction();
  let data;
  try {
    let success = false;
    let tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if (tower.isPublic !== true) {
        let member = yield member_factory_default.instance.find({ humanId: args.humanId, towerId: args.towerId }, session);
        if (member !== null) {
          if (args.offset && args.count) {
            data = yield room_factory_default.instance.read(args.offset, args.count, {
              towerId: args.towerId,
              $or: [
                {
                  title: { "$regex": args.query, "$options": "i" }
                },
                {
                  description: { "$regex": args.query, "$options": "i" }
                }
              ]
            });
          } else {
            data = yield room_factory_default.instance.read(0, 100, {
              towerId: args.towerId,
              $or: [
                {
                  title: { "$regex": args.query, "$options": "i" }
                },
                {
                  description: { "$regex": args.query, "$options": "i" }
                }
              ]
            });
          }
          success = true;
        } else {
          console.error("access denied");
          if (!_session) {
            console.error("abort transaction");
            yield session.abortTransaction();
          }
        }
      } else {
        if (args.offset && args.count) {
          data = yield room_factory_default.instance.read(args.offset, args.count, {
            towerId: args.towerId,
            $or: [
              {
                title: { "$regex": args.query, "$options": "i" }
              },
              {
                description: { "$regex": args.query, "$options": "i" }
              }
            ]
          });
        } else {
          data = yield room_factory_default.instance.read(0, 100, {
            towerId: args.towerId,
            $or: [
              {
                title: { "$regex": args.query, "$options": "i" }
              },
              {
                description: { "$regex": args.query, "$options": "i" }
              }
            ]
          });
        }
        if (!_session)
          yield session.commitTransaction();
        success = true;
      }
    } else {
      console.error("tower does not exist");
      if (!_session) {
        console.error("abort transaction");
        yield session.abortTransaction();
      }
    }
    if (!_session)
      session.endSession();
    if (success) {
      return { success: true, rooms: data, tower };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error("abort transaction");
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var search_default3 = search3;

// database/transactions/room/readById.ts
var import_mongoose37 = __toESM(require("mongoose"));
var readById3 = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose37.default.startSession();
  if (!_session)
    session.startTransaction();
  let success = false;
  try {
    let room = yield room_factory_default.instance.find({ id: args.roomId, towerId: args.towerId }, session);
    if (room !== null) {
      if (room.isPublic) {
        success = true;
      } else {
        let member = yield member_factory_default.instance.find({ humanId: args.humanId, roomId: args.roomId }, session);
        if (member !== null) {
          success = true;
        } else {
          let invite = yield invite_factory_default.instance.find({ humanId: args.humanId, roomId: args.roomId }, session);
          if (invite !== null) {
            success = true;
          }
        }
      }
    }
    let tower;
    if (success) {
      tower = yield tower_factory_default.instance.find({ id: room.towerId }, session);
    }
    if (!_session) {
      yield session.commitTransaction();
      session.endSession();
    }
    if (success) {
      return { success: true, tower, room };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error("abort transaction");
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var readById_default3 = readById3;

// database/transactions/room/update.ts
var import_mongoose38 = __toESM(require("mongoose"));
var update3 = (args, _session) => __async(void 0, null, function* () {
  if (isEmpty(args.title)) {
    console.error("title can not be empty");
    return { success: false };
  }
  if (isNameFieldInvalid(args.title)) {
    console.error("title can not be longer than limit");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose38.default.startSession();
  if (!_session)
    session.startTransaction();
  let room;
  try {
    let success = false;
    let tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      room = yield room_factory_default.instance.find({ id: args.roomId, towerId: args.towerId }, session);
      if (tower.secret.adminIds.includes(args.humanId) || room.secret.adminIds.includes(args.humanId)) {
        yield room_factory_default.instance.update({ id: args.roomId }, {
          title: args.title,
          avatarId: isEmpty(args.avatarId) ? "EMPTY" : args.avatarId,
          isPublic: args.isPublic
        }, session);
        room = yield room_factory_default.instance.find({ id: args.roomId, towerId: args.towerId }, session);
        success = true;
        if (!_session)
          yield session.commitTransaction();
      } else {
        console.error("user is not admin of the tower or room");
        if (!_session) {
          console.error("abort transaction");
          yield session.abortTransaction();
        }
      }
    } else {
      console.error("tower does not exist");
      if (!_session) {
        console.error("abort transaction");
        yield session.abortTransaction();
      }
    }
    if (!_session)
      session.endSession();
    if (success) {
      return { success: true, room };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error("abort transaction");
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var update_default3 = update3;

// database/transactions/invite/index.ts
var invite_exports = {};
__export(invite_exports, {
  accept: () => accept_default,
  cancel: () => cancel_default,
  create: () => create_default3,
  decline: () => decline_default,
  read: () => read_default2
});

// database/transactions/invite/create.ts
var import_mongoose39 = __toESM(require("mongoose"));
var create3 = (args, _session) => __async(void 0, null, function* () {
  if (isIdEmpty(args.towerId)) {
    console.error("tower id can not be empty");
    return { success: false };
  }
  if (isIdEmpty(args.targetHumanId)) {
    console.error("user id can not be empty");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose39.default.startSession();
  if (!_session)
    session.startTransaction();
  let invite, tower;
  try {
    let success = false;
    invite = yield invite_factory_default.instance.find({ humanId: args.targetHumanId, towerId: args.towerId }, session);
    if (invite === null) {
      tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
      if (tower.secret.adminIds.includes(args.senderId)) {
        let user = yield human_factory_default.instance.find({ id: args.targetHumanId }, session);
        if (user !== null) {
          invite = yield invite_factory_default.instance.create({
            id: makeUniqueId(),
            humanId: args.targetHumanId,
            towerId: args.towerId
          }, session);
          success = true;
          if (!_session)
            yield session.commitTransaction();
        } else {
          console.error("user not found");
          if (!_session) {
            console.error("abort transaction");
            yield session.abortTransaction();
          }
        }
      } else {
        console.error("user is not admin of the tower or room");
        if (!_session) {
          console.error("abort transaction");
          yield session.abortTransaction();
        }
      }
    } else {
      console.error("invite already exists");
      if (!_session) {
        console.error("abort transaction");
        yield session.abortTransaction();
      }
    }
    if (!_session)
      session.endSession();
    if (success) {
      return { success: true, invite: __spreadProps(__spreadValues({}, invite), { tower }) };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error("abort transaction");
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var create_default3 = create3;

// database/transactions/invite/accept.ts
var import_mongoose40 = __toESM(require("mongoose"));
var accept = (args, _session) => __async(void 0, null, function* () {
  if (isIdEmpty(args.inviteId)) {
    console.error("invite id can not be empty");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose40.default.startSession();
  if (!_session)
    session.startTransaction();
  let member, room, tower, rooms;
  try {
    let invite = yield invite_factory_default.instance.find({ id: args.inviteId, humanId: args.humanId, towerId: args.towerId }, session);
    if (invite !== null) {
      yield Promise.all([
        (() => __async(void 0, null, function* () {
          tower = yield tower_factory_default.instance.find({ id: invite.towerId }, session);
        }))(),
        (() => __async(void 0, null, function* () {
          member = yield member_factory_default.instance.create({
            id: makeUniqueId(),
            humanId: invite.humanId,
            towerId: invite.towerId,
            secret: {
              permissions: permissions_default.DEFAULT_ROOM_ADMIN_PERMISSIONS
            }
          }, session);
        }))(),
        (() => __async(void 0, null, function* () {
          yield invite_factory_default.instance.remove({ id: invite.id }, session);
        }))(),
        (() => __async(void 0, null, function* () {
          rooms = yield room_factory_default.instance.findGroup({ towerId: invite.towerId }, session);
        }))()
      ]);
      if (!_session) {
        yield session.commitTransaction();
        session.endSession();
      }
      return {
        success: true,
        member,
        rooms,
        tower,
        room
      };
    } else {
      console.error("invite not found");
      if (!_session) {
        console.error("abort transaction");
        yield session.abortTransaction();
        session.endSession();
      }
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error("abort transaction");
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var accept_default = accept;

// database/transactions/invite/decline.ts
var import_mongoose41 = __toESM(require("mongoose"));
var decline = (args, _session) => __async(void 0, null, function* () {
  if (isIdEmpty(args.inviteId)) {
    console.error("invite id can not be empty");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose41.default.startSession();
  if (!_session)
    session.startTransaction();
  let tower;
  try {
    let success = false;
    let invite = yield invite_factory_default.instance.find({ id: args.inviteId, humanId: args.humanId, towerId: args.towerId }, session);
    if (invite !== null) {
      tower = yield tower_factory_default.instance.find({ id: invite.towerId }, session);
      yield invite_factory_default.instance.remove({ id: invite.id }, session);
      success = true;
      if (!_session)
        yield session.commitTransaction();
    } else {
      console.error("invite not found");
      if (!_session) {
        console.error("abort transaction");
        yield session.abortTransaction();
      }
    }
    if (!_session)
      session.endSession();
    if (success) {
      return { success: true, adminIds: tower.secret.adminIds };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error("abort transaction");
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var decline_default = decline;

// database/transactions/invite/cancel.ts
var import_mongoose42 = __toESM(require("mongoose"));
var cancel = (args, _session) => __async(void 0, null, function* () {
  if (isIdEmpty(args.inviteId)) {
    console.error("invite id can not be empty");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose42.default.startSession();
  if (!_session)
    session.startTransaction();
  let targetHumanId;
  try {
    let success = false;
    let invite = yield invite_factory_default.instance.find({ id: args.inviteId, towerId: args.towerId }, session);
    if (invite !== null) {
      targetHumanId = invite.humanId;
      let tower = yield tower_factory_default.instance.find({ id: invite.towerId }, session);
      if (tower.secret.adminIds.includes(args.humanId)) {
        yield invite_factory_default.instance.remove({ id: invite.id }, session);
        success = true;
        if (!_session)
          yield session.commitTransaction();
      } else {
        console.error("access denied");
        if (!_session) {
          console.error("abort transaction");
          yield session.abortTransaction();
        }
      }
    } else {
      console.error("invite not found");
      if (!_session) {
        console.error("abort transaction");
        yield session.abortTransaction();
      }
    }
    if (!_session)
      session.endSession();
    if (success) {
      if (targetHumanId) {
        return { success: true, targetHumanId };
      } else {
        return { success: true };
      }
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error("abort transaction");
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var cancel_default = cancel;

// database/transactions/invite/read.ts
var read2 = (args, _session) => __async(void 0, null, function* () {
  try {
    let invites = yield invite_factory_default.instance.read({ humanId: args.humanId });
    let towers = yield tower_factory_default.instance.findGroup({ id: { $in: invites.map((i) => i.towerId) } });
    let towersDict = {};
    towers.forEach((tower) => {
      towersDict[tower.id] = tower;
    });
    let finalResult = invites.map((invite) => __spreadProps(__spreadValues({}, invite), { tower: towersDict[invite.towerId] }));
    return { success: true, invites: finalResult };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
});
var read_default2 = read2;

// database/transactions/permission/index.ts
var permission_exports = {};
__export(permission_exports, {
  read: () => read_default3,
  update: () => update_default4
});

// database/transactions/permission/update.ts
var import_mongoose43 = __toESM(require("mongoose"));
var update4 = (args, _session) => __async(void 0, null, function* () {
  if (args.permissions === void 0) {
    console.error("permissions can not be empty");
    return { success: false };
  }
  if (args.targetHumanId === args.humanId) {
    console.error("access denied");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose43.default.startSession();
  if (!_session)
    session.startTransaction();
  let member;
  try {
    let success = false;
    let tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if (tower.secret.ownerId === args.humanId || tower.secret.adminIds.includes(args.humanId) && !tower.secret.adminIds.includes(args.targetHumanId)) {
        let member2 = yield member_factory_default.instance.update({ humanId: args.targetHumanId, towerId: args.towerId }, {
          secret: {
            permissions: args.permissions
          }
        }, session);
        if (member2 !== null) {
          if (!_session)
            yield session.commitTransaction();
          success = true;
        } else {
          console.error("access denied");
          if (!_session) {
            console.error("abort transaction");
            yield session.abortTransaction();
          }
        }
      } else {
        console.error("access denied");
        if (!_session) {
          console.error("abort transaction");
          yield session.abortTransaction();
        }
      }
    } else {
      console.error("tower does not exist");
      if (!_session) {
        console.error("abort transaction");
        yield session.abortTransaction();
      }
    }
    if (!_session)
      session.endSession();
    return { success };
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error("abort transaction");
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var update_default4 = update4;

// database/transactions/permission/read.ts
var import_mongoose44 = __toESM(require("mongoose"));
var read3 = (args, _session) => __async(void 0, null, function* () {
  var _a;
  const session = _session ? _session : yield import_mongoose44.default.startSession();
  if (!_session)
    session.startTransaction();
  try {
    let success = false;
    let permissions = {};
    let tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      if (tower.secret.ownerId === args.humanId || tower.secret.adminIds.includes(args.humanId) && !tower.secret.adminIds.includes(args.targetHumanId)) {
        let member = yield member_factory_default.instance.find({ humanId: args.targetHumanId, towerId: args.towerId }, session);
        if (member !== null) {
          permissions = ((_a = member.secret) == null ? void 0 : _a.permissions) ? member.secret.permissions : {};
          if (!_session)
            yield session.commitTransaction();
          success = true;
        } else {
          console.error("access denied");
          if (!_session) {
            console.error("abort transaction");
            yield session.abortTransaction();
          }
        }
      } else {
        console.error("access denied");
        if (!_session) {
          console.error("abort transaction");
          yield session.abortTransaction();
        }
      }
    } else {
      console.error("tower does not exist");
      if (!_session) {
        console.error("abort transaction");
        yield session.abortTransaction();
      }
    }
    if (!_session)
      session.endSession();
    return { success };
  } catch (error) {
    console.error(error);
    if (!_session) {
      console.error("abort transaction");
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var read_default3 = read3;

// database/transactions/machine/index.ts
var machine_exports = {};
__export(machine_exports, {
  create: () => create_default4,
  read: () => read_default4,
  remove: () => remove_default3,
  search: () => search_default4,
  signIn: () => signIn_default2,
  update: () => update_default5
});

// database/transactions/machine/create.ts
var import_mongoose45 = __toESM(require("mongoose"));
var create4 = (args, _session) => __async(void 0, null, function* () {
  if (isEmpty(args.name)) {
    console.error("title can not be empty");
    return { success: false };
  }
  if (isNameFieldInvalid(args.name)) {
    console.error("title can not be longer than limit");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose45.default.startSession();
  if (!_session)
    session.startTransaction();
  let machine;
  try {
    machine = yield machine_factory_default.instance.create({
      id: makeUniqueId(),
      name: args.name,
      secret: {
        token: makeUniqueId(),
        creatorId: args.creatorId
      }
    }, session);
    if (!_session) {
      yield session.commitTransaction();
      session.endSession();
    }
    return { success: true, machine };
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var create_default4 = create4;

// database/transactions/machine/update.ts
var import_mongoose46 = __toESM(require("mongoose"));
var update5 = (args, _session) => __async(void 0, null, function* () {
  if (isEmpty(args.name)) {
    console.error("title can not be empty");
    return { success: false };
  }
  if (isNameFieldInvalid(args.name)) {
    console.error("title can not be longer than limit");
    return { success: false };
  }
  const session = _session ? _session : yield import_mongoose46.default.startSession();
  if (!_session)
    session.startTransaction();
  try {
    let success = false;
    let machine = yield machine_factory_default.instance.find({ id: args.machineId }, session);
    if (machine !== null) {
      if (machine.secret.creatorId === args.humanId) {
        machine = yield machine_factory_default.instance.update({ id: machine.id }, {
          name: args.name
        }, session);
        success = true;
        if (!_session)
          yield session.commitTransaction();
      } else {
        console.error("user is not admin of the tower");
        console.error("abort transaction");
        if (!_session)
          yield session.abortTransaction();
      }
    } else {
      console.error("tower does not exist");
      console.error("abort transaction");
      if (!_session)
        yield session.abortTransaction();
    }
    if (!_session)
      session.endSession();
    if (success) {
      return { success: true, machine };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var update_default5 = update5;

// database/transactions/machine/remove.ts
var import_mongoose47 = __toESM(require("mongoose"));
var remove3 = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose47.default.startSession();
  if (!_session)
    session.startTransaction();
  try {
    let memberIds;
    let success = false;
    let machine = yield machine_factory_default.instance.find({ id: args.machineId }, session);
    if (machine !== null) {
      if (machine.secret.creatorId === args.humanId) {
        yield machine_factory_default.instance.remove({ id: machine.id }, session);
        success = true;
        if (!_session)
          yield session.commitTransaction();
      } else {
        console.error("user is not admin of the tower");
        console.error("abort transaction");
        if (!_session)
          yield session.abortTransaction();
      }
    } else {
      console.error("tower does not exist");
      console.error("abort transaction");
      if (!_session)
        yield session.abortTransaction();
    }
    if (!_session)
      session.endSession();
    if (success) {
      return { success: true, machine };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var remove_default3 = remove3;

// database/transactions/machine/search.ts
var import_mongoose48 = __toESM(require("mongoose"));
var search4 = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose48.default.startSession();
  if (!_session)
    session.startTransaction();
  let data;
  try {
    if (args.offset === void 0 && args.count === void 0) {
      data = yield machine_factory_default.instance.read(0, 100, {
        name: { "$regex": args.query, "$options": "i" }
      });
    } else {
      data = yield machine_factory_default.instance.read(args.offset, args.count, {
        name: { "$regex": args.query, "$options": "i" }
      });
    }
    if (!_session) {
      yield session.commitTransaction();
      session.endSession();
    }
    return { success: true, machines: data };
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var search_default4 = search4;

// database/transactions/machine/read.ts
var import_mongoose49 = __toESM(require("mongoose"));
var read4 = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose49.default.startSession();
  if (!_session)
    session.startTransaction();
  let data;
  try {
    if (args.offset === void 0 && args.count === void 0) {
      data = yield machine_factory_default.instance.read(0, 100);
    } else {
      data = yield machine_factory_default.instance.read(args.offset, args.count);
    }
    if (!_session) {
      yield session.commitTransaction();
      session.endSession();
    }
    return { success: true, machines: data };
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var read_default4 = read4;

// database/transactions/machine/signIn.ts
var signIn2 = (args, _session) => __async(void 0, null, function* () {
  let workerships = yield worker_factory_default.instance.read({ machineId: args.machineId });
  let rooms = yield room_factory_default.instance.findGroup({ id: { $in: workerships.map((w) => w.roomId) } });
  let towerIds = (yield tower_factory_default.instance.findGroup({ id: { $in: rooms.map((r) => r.towerId) } })).map((t) => t.id);
  return { success: true, towerIds };
});
var signIn_default2 = signIn2;

// database/transactions/worker/index.ts
var worker_exports = {};
__export(worker_exports, {
  create: () => create_default5,
  read: () => read_default5,
  remove: () => remove_default4,
  update: () => update_default6
});

// database/transactions/worker/create.ts
var import_mongoose50 = __toESM(require("mongoose"));
var create5 = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose50.default.startSession();
  if (!_session)
    session.startTransaction();
  let worker;
  try {
    console.log("hello");
    let member = yield member_factory_default.instance.find({ towerId: args.towerId, humanId: args.humanId }, session);
    console.log("member", member);
    if (member !== null) {
      let room = yield room_factory_default.instance.find({ id: args.roomId, towerId: member.towerId }, session);
      console.log("room", room);
      if (room !== null) {
        worker = yield worker_factory_default.instance.create({
          id: makeUniqueId(),
          machineId: args.machineId,
          roomId: args.roomId,
          secret: args.secret
        }, session);
        if (!_session) {
          yield session.commitTransaction();
          session.endSession();
        }
        return { success: true, worker };
      } else {
        if (!_session) {
          yield session.abortTransaction();
          session.endSession();
        }
        return { success: false };
      }
    } else {
      if (!_session) {
        yield session.abortTransaction();
        session.endSession();
      }
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var create_default5 = create5;

// database/transactions/worker/remove.ts
var import_mongoose51 = __toESM(require("mongoose"));
var remove4 = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose51.default.startSession();
  if (!_session)
    session.startTransaction();
  try {
    let member = yield member_factory_default.instance.find({ towerId: args.towerId, humanId: args.humanId }, session);
    if (member !== null) {
      let room = yield room_factory_default.instance.find({ id: args.roomId, towerId: member.towerId }, session);
      if (room !== null) {
        let worker = yield worker_factory_default.instance.find({ id: args.workerId }, session);
        if (worker !== null) {
          yield worker_factory_default.instance.remove({ id: args.workerId }, session);
          let otherWorkersOfSameMachine = yield worker_factory_default.instance.read({ machineId: worker.machineId, roomId: worker.roomId });
          if (!_session) {
            yield session.commitTransaction();
            session.endSession();
          }
          return { success: true, worker, wasTheLast: otherWorkersOfSameMachine.length === 0 };
        } else {
          if (!_session) {
            yield session.abortTransaction();
            session.endSession();
          }
          return { success: false };
        }
      } else {
        if (!_session) {
          yield session.abortTransaction();
          session.endSession();
        }
        return { success: false };
      }
    } else {
      if (!_session) {
        yield session.abortTransaction();
        session.endSession();
      }
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var remove_default4 = remove4;

// database/transactions/worker/read.ts
var import_mongoose52 = __toESM(require("mongoose"));
var read5 = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose52.default.startSession();
  if (!_session)
    session.startTransaction();
  let data, success = false;
  try {
    let tower = yield tower_factory_default.instance.find({ id: args.towerId }, session);
    if (tower !== null) {
      let room = yield room_factory_default.instance.find({ id: args.roomId, towerId: tower.id }, session);
      if (room !== null) {
        if (tower.isPublic) {
          data = yield worker_factory_default.instance.read({ roomId: room.id });
          success = true;
        } else {
          let member = yield member_factory_default.instance.find({ towerId: tower.id, humanId: args.humanId }, session);
          if (member !== null) {
            data = yield worker_factory_default.instance.read({ roomId: room.id });
            success = true;
          }
        }
      }
    }
    if (!_session) {
      yield session.commitTransaction();
      session.endSession();
    }
    return { success: true, workers: data };
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var read_default5 = read5;

// database/transactions/worker/update.ts
var import_mongoose53 = __toESM(require("mongoose"));
var update6 = (args, _session) => __async(void 0, null, function* () {
  const session = _session ? _session : yield import_mongoose53.default.startSession();
  if (!_session)
    session.startTransaction();
  try {
    let member = yield member_factory_default.instance.find({ towerId: args.towerId, humanId: args.humanId }, session);
    if (member !== null) {
      let room = yield room_factory_default.instance.find({ id: args.roomId, towerId: member.towerId }, session);
      if (room !== null) {
        let worker = yield worker_factory_default.instance.find({ id: args.worker.id }, session);
        if (worker !== null) {
          worker = yield worker_factory_default.instance.update({ id: args.worker.id }, args.worker, session);
          if (!_session) {
            yield session.commitTransaction();
            session.endSession();
          }
          return { success: true, worker };
        } else {
          if (!_session) {
            yield session.abortTransaction();
            session.endSession();
          }
          return { success: false };
        }
      } else {
        if (!_session) {
          yield session.abortTransaction();
          session.endSession();
        }
        return { success: false };
      }
    } else {
      if (!_session) {
        yield session.abortTransaction();
        session.endSession();
      }
      return { success: false };
    }
  } catch (error) {
    console.error(error);
    console.error("abort transaction");
    if (!_session) {
      yield session.abortTransaction();
      session.endSession();
    }
    return { success: false };
  }
});
var update_default6 = update6;

// utils/filter.ts
function secureObject(obj, forbiddenKey) {
  let newObj = __spreadValues({}, obj);
  delete newObj[forbiddenKey];
  return newObj;
}

// guardian/authenticate.ts
var authenticate = (token) => __async(void 0, null, function* () {
  let humanId = yield memory_default.instance.fetch(`auth:${token}`);
  if (humanId) {
    return { granted: true, humanId };
  } else {
    return { granted: false };
  }
});
var authenticate_default = authenticate;

// guardian/authorize.ts
var authorize = (client, towerId, roomId) => __async(void 0, null, function* () {
  if (client.towerId === towerId) {
    if (roomId) {
      if (yield memory_default.instance.fetch(`struct:${towerId}:${roomId}`)) {
        return { granted: true, rights: client.rights, roomId };
      } else {
        return { granted: false };
      }
    } else {
      return { granted: true, rights: client.rights };
    }
  }
  if (client.humanId) {
    let rights = yield memory_default.instance.fetch(`rights:${towerId}:${client.humanId}`);
    if (rights) {
      client.towerId = towerId;
      if (roomId) {
        if (yield memory_default.instance.fetch(`struct:${towerId}:${roomId}`)) {
          return { granted: true, rights, roomId };
        } else {
          return { granted: false };
        }
      } else {
        return { granted: true, rights };
      }
    } else {
      return { granted: false };
    }
  } else {
    return { granted: false };
  }
});
var authorize_default = authorize;

// guardian/rules/addRule.ts
var addRule = (towerId, humanId, permissions) => {
  memory_default.instance.save(
    `rights:${towerId}:${humanId}`,
    permissions
  );
};
var addRule_default = addRule;

// guardian/rules/isRule.ts
var isRule = (towerId, humanId) => __async(void 0, null, function* () {
  return (yield memory_default.instance.fetch(
    `rights:${towerId}:${humanId}`
  )) !== void 0;
});
var isRule_default = isRule;

// guardian/rules/removeRule.ts
var removeRule = (towerId, humanId) => {
  memory_default.instance.remove(
    `rights:${towerId}:${humanId}`
  );
};
var removeRule_default = removeRule;

// guardian/rules/removeRules.ts
var removeRules = (towerId, humanIds) => {
  let keys = humanIds.map((i) => `rights:${towerId}:${i}`);
  memory_default.instance.remove(keys);
};
var removeRules_default = removeRules;

// guardian/rules/index.ts
var rules_default = {
  addRule: addRule_default,
  isRule: isRule_default,
  removeRule: removeRule_default,
  removeRules: removeRules_default
};

// guardian/index.ts
var Guardian = class _Guardian {
  constructor() {
    this.authenticate = authenticate_default;
    this.authorize = authorize_default;
    this.rules = rules_default;
    _Guardian._instance = this;
  }
  static get instance() {
    return _Guardian._instance;
  }
  static initialize() {
    return new _Guardian();
  }
};

// extendables.ts
var EntityTypes = {
  ROOM_CREATION: "room_creation"
};
var Extendables = class {
  constructor() {
    this.callbacks = {
      creations: {
        rooms: {
          inject(callback) {
            this.callbacks[EntityTypes.ROOM_CREATION] = callback;
          }
        }
      }
    };
  }
};

// services/human.service.ts
var HumanService = class {
  constructor(meta) {
    this.extendables = meta.extendables;
  }
  signUp(client, body, requestId) {
    return __async(this, null, function* () {
      return human_exports.signUp(body);
    });
  }
  signIn(client, body, requestId) {
    return __async(this, null, function* () {
      let { humanId, granted } = yield Guardian.authenticate(body.token);
      if (granted) {
        let result = yield human_exports.signIn({ humanId });
        client.updateHumanId(humanId);
        client.updateToken(body.token);
        network_default.instance.keepClient(body.token, client);
        client.joinTowers(result.memberships.map((m) => m.towerId));
        network_default.instance.lastSeens[humanId] = -1;
        return { success: true };
      } else {
        return { success: false };
      }
    });
  }
  verify(client, body, requestId) {
    return __async(this, null, function* () {
      let result = yield human_exports.verify(body);
      if (result.success && result.human) {
        result.towers = result.towers.map((tower) => tower.secret.ownerId === result.human.id ? tower : secureObject(tower, "secret"));
        yield memory_default.instance.save(`auth:${result.session.token}`, result.human.id);
      }
      return result;
    });
  }
  complete(client, body, requestId) {
    return __async(this, null, function* () {
      let result = yield human_exports.complete(__spreadProps(__spreadValues({}, body), { creationCallback: this.extendables.store[EntityTypes.ROOM_CREATION] }));
      if (result.success) {
        yield Promise.all([
          memory_default.instance.save(`auth:${result.session.token}`, result.human.id),
          memory_default.instance.save(`struct:${result.tower.id}:${result.room.id}`, true),
          Guardian.rules.addRule(result.member.towerId, result.member.humanId, result.member.secret.permissions)
        ]);
      }
      return result;
    });
  }
  update(client, body, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        return human_exports.update(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
      } else {
        return { success: false };
      }
    });
  }
  readById(client, body, requestId) {
    return __async(this, null, function* () {
      let result = yield human_exports.readById(body);
      if (result.success && result.human) {
        result.human = __spreadProps(__spreadValues({}, secureObject(result.human, "secret")), { lastseen: result.human.secret.lastSeen });
      }
      return result;
    });
  }
  readGroupById(client, body, requestId) {
    return __async(this, null, function* () {
      let result = yield human_exports.readGroupById(body);
      if (result.success && result.humans) {
        result.humans = result.humans.map((human) => __spreadProps(__spreadValues({}, secureObject(human, "secret")), { lastseen: human.secret.lastSeen }));
      }
      return result;
    });
  }
  search(client, body, requestId) {
    return __async(this, null, function* () {
      let result = yield human_exports.search(body);
      if (result.success && result.humans)
        result.humans = result.humans.map((u) => secureObject(u, "secret"));
      return result;
    });
  }
  signOut(client, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        let result = yield human_exports.signOut({ humanId: client.humanId });
        network_default.instance.looseClient(client);
        client.leaveTowers(result.memberships.map((m) => m.towerId));
        client.reset();
        return result;
      } else {
        return { success: false };
      }
    });
  }
  lastSeens(client, body, requestId) {
    return __async(this, null, function* () {
      let lastSeensData = {};
      body.humanIds.forEach((humanId) => {
        lastSeensData[humanId] = network_default.instance.lastSeens[humanId];
      });
      return { success: true, lastSeens: lastSeensData };
    });
  }
};
var human_service_default = HumanService;

// controllers/human.controller.ts
var HumanController = class extends base_controller_default {
  constructor(service) {
    super();
    this.service = service;
  }
  getName() {
    return "human";
  }
  signUp(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.signUp(client, body, requestId);
      response(result);
    });
  }
  signIn(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.signIn(client, body, requestId);
      response(result);
    });
  }
  verify(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.verify(client, body, requestId);
      response(result);
    });
  }
  complete(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.complete(client, body, requestId);
      response(result);
    });
  }
  update(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.update(client, body, requestId);
      response(result);
    });
  }
  readById(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.readById(client, body, requestId);
      response(result);
    });
  }
  search(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.search(client, body, requestId);
      response(result);
    });
  }
  signOut(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.signOut(client, requestId);
      response(result);
    });
  }
};
var human_controller_default = HumanController;

// controllers/tower.controller.ts
var TowerController = class extends base_controller_default {
  constructor(service) {
    super();
    this.service = service;
  }
  getName() {
    return "tower";
  }
  create(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.create(client, body, requestId);
      response(result);
    });
  }
  update(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.update(client, body, requestId);
      response(result);
    });
  }
  remove(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.remove(client, body, requestId);
      response(result);
    });
  }
  search(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.search(client, body, requestId);
      response(result);
    });
  }
  join(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.join(client, body, requestId);
      response(result);
    });
  }
  readById(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.readById(client, body, requestId);
      response(result);
    });
  }
  readMembers(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.readMembers(client, body, requestId);
      response(result);
    });
  }
  read(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.read(client, body, requestId);
      response(result);
    });
  }
};
var tower_controller_default = TowerController;

// updater/tower/index.ts
var tower_exports2 = {};
__export(tower_exports2, {
  onHumanJoin: () => onHumanJoin_default,
  onRemove: () => onRemove_default,
  onUpdate: () => onUpdate_default
});

// updater/base.ts
var Update = class {
  constructor(requestId) {
    this.requestId = requestId;
    this.type = "";
  }
};
var base_default = Update;

// updater/tower/onUpdate.ts
var OnTowerUpdate = class extends base_default {
  constructor(requestId, tower) {
    super(requestId);
    this.tower = tower;
  }
};
var onUpdate_default = OnTowerUpdate;

// updater/tower/onRemove.ts
var OnTowerRemove = class extends base_default {
  constructor(requestId, tower) {
    super(requestId);
    this.tower = tower;
  }
};
var onRemove_default = OnTowerRemove;

// updater/tower/onHumanJoin.ts
var onHumanJoin = class extends base_default {
  constructor(requestId, member) {
    super(requestId);
    this.member = member;
  }
};
var onHumanJoin_default = onHumanJoin;

// updater/room/index.ts
var room_exports2 = {};
__export(room_exports2, {
  onCreate: () => onCreate_default,
  onRemove: () => onRemove_default2,
  onUpdate: () => onUpdate_default2
});

// updater/room/onUpdate.ts
var OnRoomUpdate = class extends base_default {
  constructor(requestId, room) {
    super(requestId);
    this.room = room;
  }
};
var onUpdate_default2 = OnRoomUpdate;

// updater/room/onRemove.ts
var OnRoomRemove = class extends base_default {
  constructor(requestId, room) {
    super(requestId);
    this.room = room;
  }
};
var onRemove_default2 = OnRoomRemove;

// updater/room/onCreate.ts
var onRoomCreate = class extends base_default {
  constructor(requestId, room) {
    super(requestId);
    this.room = room;
  }
};
var onCreate_default = onRoomCreate;

// updater/permission/index.ts
var permission_exports2 = {};
__export(permission_exports2, {
  onUpdate: () => onUpdate_default3
});

// updater/permission/onUpdate.ts
var OnPermissionUpdate = class extends base_default {
  constructor(requestId, permissions) {
    super(requestId);
    this.permissions = permissions;
  }
};
var onUpdate_default3 = OnPermissionUpdate;

// updater/invite/index.ts
var invite_exports2 = {};
__export(invite_exports2, {
  onAccept: () => onAccept_default,
  onCancel: () => onCancel_default,
  onCreate: () => onCreate_default2,
  onDecline: () => onDecline_default
});

// updater/invite/onAccept.ts
var OnInviteAccept = class extends base_default {
  constructor(requestId, inviteId) {
    super(requestId);
    this.inviteId = inviteId;
  }
};
var onAccept_default = OnInviteAccept;

// updater/invite/onCancel.ts
var OnInviteCancel = class extends base_default {
  constructor(requestId, inviteId) {
    super(requestId);
    this.inviteId = inviteId;
  }
};
var onCancel_default = OnInviteCancel;

// updater/invite/onCreate.ts
var onInviteCreate = class extends base_default {
  constructor(requestId, invite) {
    super(requestId);
    this.invite = invite;
  }
};
var onCreate_default2 = onInviteCreate;

// updater/invite/onDecline.ts
var OnInviteDecline = class extends base_default {
  constructor(requestId, inviteId) {
    super(requestId);
    this.inviteId = inviteId;
  }
};
var onDecline_default = OnInviteDecline;

// updater/worker/index.ts
var worker_exports2 = {};
__export(worker_exports2, {
  onRequest: () => onRequest_default,
  onResponse: () => onResponse_default
});

// updater/worker/onRequest.ts
var onWorkerRequest = class extends base_default {
  constructor(requestId, packet) {
    super(requestId);
    this.packet = packet;
  }
};
var onRequest_default = onWorkerRequest;

// updater/worker/onResponse.ts
var onWorkerResponse = class extends base_default {
  constructor(requestId, packet) {
    super(requestId);
    this.packet = packet;
  }
};
var onResponse_default = onWorkerResponse;

// updater/index.ts
var updatesDict = {
  tower: tower_exports2,
  room: room_exports2,
  permission: permission_exports2,
  invite: invite_exports2,
  worker: worker_exports2
};
var buildUpdate = (requestId, path, ...args) => {
  let T = updatesDict[path.category][path.key];
  let updateObject = new T(requestId, ...args);
  updateObject.type = `${path.category}/${path.key}`;
  return updateObject;
};
var types = {
  tower: {
    onUpdate: { category: "tower", key: "onUpdate" },
    onRemove: { category: "tower", key: "onRemove" },
    onHumanJoin: { category: "tower", key: "onHumanJoin" }
  },
  room: {
    onCreate: { category: "room", key: "onCreate" },
    onUpdate: { category: "room", key: "onUpdate" },
    onRemove: { category: "room", key: "onRemove" }
  },
  permission: {
    onUpdate: { category: "permission", key: "onUpdate" }
  },
  invite: {
    onCreate: { category: "invite", key: "onCreate" },
    onCancel: { category: "invite", key: "onCancel" },
    onAccept: { category: "invite", key: "onAccept" },
    onDecline: { category: "invite", key: "onDecline" }
  },
  worker: {
    onRequest: { category: "worker", key: "onRequest" },
    onResponse: { category: "worker", key: "onResponse" },
    onPush: { category: "worker", key: "onPush" }
  }
};
var registerUpdateType = (type, path) => {
  if (!types[path.category]) {
    types[path.category] = {};
    updatesDict[path.category] = {};
  }
  types[path.category][path.key] = path;
  updatesDict[path.category][path.key] = type;
};
var group = (towerId) => {
  return network_default.instance.group(towerId);
};
var Updater = class _Updater {
  constructor() {
    this.types = types;
    this.buildUpdate = buildUpdate;
    this.registerUpdateType = registerUpdateType;
    this.group = group;
    _Updater._instance = this;
  }
  static get instance() {
    return _Updater._instance;
  }
  static initialize() {
    return new _Updater();
  }
};

// services/tower.service.ts
var TowerService = class {
  constructor(meta) {
    this.extendables = meta.extendables;
  }
  create(client, body, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        let result = yield tower_exports.create(__spreadProps(__spreadValues({}, body), { ownerId: client.humanId, creationCallback: this.extendables.store[EntityTypes.ROOM_CREATION] }));
        if (result.success) {
          Guardian.instance.rules.addRule(result.member.towerId, result.member.humanId, result.member.secret.permissions);
          client.updateTowerId(result.tower.id, result.member.secret.permissions);
          client.joinTower(result.tower.id);
          yield memory_default.instance.save(`struct:${result.tower.id}:${result.room.id}`, true);
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  update(client, body, requestId) {
    return __async(this, null, function* () {
      let { granted } = yield Guardian.instance.authorize(client, body.towerId);
      if (granted) {
        let result = yield tower_exports.update(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        if (result.success) {
          network_default.instance.group(body.towerId).boradcast.emit(client, Updater.instance.buildUpdate(requestId, Updater.instance.types.tower.onUpdate, secureObject(result.tower, "secret")));
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  remove(client, body, requestId) {
    return __async(this, null, function* () {
      let { granted } = yield Guardian.instance.authorize(client, body.towerId);
      if (granted) {
        let result = yield tower_exports.remove(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        if (result.success) {
          network_default.instance.group(body.towerId).boradcast.emit(client, Updater.instance.buildUpdate(requestId, Updater.instance.types.tower.onRemove, secureObject(result.tower, "secret")));
          Guardian.instance.rules.removeRules(body.towerId, result.memberIds);
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  search(client, body, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        let result = yield tower_exports.search(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        if (result.success && result.towers) {
          result.towers = result.towers.map((t) => t.secret.ownerId === client.humanId ? t : secureObject(t, "secret"));
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  join(client, body, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        let result = yield tower_exports.join(__spreadProps(__spreadValues({}, body), { requesterId: client.humanId }));
        if (result.success) {
          network_default.instance.group(body.towerId).boradcast.emit(client, Updater.instance.buildUpdate(requestId, Updater.instance.types.tower.onHumanJoin, secureObject(result.member, "secret")));
          Guardian.instance.rules.addRule(result.member.towerId, result.member.humanId, result.member.secret.permissions);
          client.updateTowerId(result.member.towerId, result.member.secret.permissions);
          client.joinTower(result.member.towerId);
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  readById(client, body, requestId) {
    return __async(this, null, function* () {
      return tower_exports.readById(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
    });
  }
  readMembers(client, body, requestId) {
    return __async(this, null, function* () {
      let { granted } = yield Guardian.instance.authorize(client, body.towerId);
      if (granted) {
        return tower_exports.readMembers(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
      } else {
        return { success: false };
      }
    });
  }
  read(client, body, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        let result = yield tower_exports.read({ humanId: client.humanId });
        if (result.success && result.towers) {
          result.towers = result.towers.map((t) => t.secret.ownerId === client.humanId ? t : secureObject(t, "secret"));
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  addMember(towerId, humanId) {
    return __async(this, null, function* () {
      let result = yield tower_exports.addMember({ humanId, towerId });
      return result;
    });
  }
};
var tower_service_default = TowerService;

// services/room.service.ts
var RoomService = class {
  constructor(meta) {
    this.extendables = meta.extendables;
  }
  create(client, body, requestId) {
    return __async(this, null, function* () {
      let { granted } = yield Guardian.instance.authorize(client, body.towerId);
      if (granted) {
        let result = yield room_exports.create(__spreadProps(__spreadValues({}, body), { humanId: client.humanId, creationCallback: this.extendables.store[EntityTypes.ROOM_CREATION] }));
        if (result.success) {
          network_default.instance.group(body.towerId).boradcast.emit(client, Updater.instance.buildUpdate(
            requestId,
            Updater.instance.types.room.onCreate,
            secureObject(result.room, "secret")
          ));
          yield memory_default.instance.save(`struct:${body.towerId}:${result.room.id}`, true);
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  remove(client, body, requestId) {
    return __async(this, null, function* () {
      let { granted } = yield Guardian.instance.authorize(client, body.towerId);
      if (granted) {
        let result = yield room_exports.remove(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        if (result.success) {
          network_default.instance.group(body.towerId).boradcast.emit(client, Updater.instance.buildUpdate(
            requestId,
            Updater.instance.types.room.onRemove,
            secureObject(result.room, "secret")
          ));
          yield memory_default.instance.remove(`struct:${body.towerId}:${result.room.id}`);
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  search(client, body, requestId) {
    return __async(this, null, function* () {
      let { granted } = yield Guardian.instance.authorize(client, body.towerId);
      if (granted) {
        let result = yield room_exports.search(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        if (result.success && result.rooms) {
          if (!result.tower.secret.adminIds.includes(client.humanId)) {
            result.rooms = result.rooms.map((r) => secureObject(r, "secret"));
          }
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  readById(client, body, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        return room_exports.readById(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
      } else {
        return { success: false };
      }
    });
  }
  update(client, body, requestId) {
    return __async(this, null, function* () {
      let { granted } = yield Guardian.instance.authorize(client, body.towerId);
      if (granted) {
        let result = yield room_exports.update(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        if (result.success) {
          network_default.instance.group(body.towerId).boradcast.emit(client, Updater.instance.buildUpdate(
            requestId,
            Updater.instance.types.room.onUpdate,
            secureObject(result.room, "secret")
          ));
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
};
var room_service_default = RoomService;

// controllers/room.controller.ts
var RoomController = class extends base_controller_default {
  constructor(service) {
    super();
    this.service = service;
  }
  getName() {
    return "room";
  }
  create(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.create(client, body, requestId);
      response(result);
    });
  }
  remove(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.remove(client, body, requestId);
      response(result);
    });
  }
  search(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.search(client, body, requestId);
      response(result);
    });
  }
  readById(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.readById(client, body, requestId);
      response(result);
    });
  }
  update(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.update(client, body, requestId);
      response(result);
    });
  }
};
var room_controller_default = RoomController;

// controllers/invite.controller.ts
var InviteController = class extends base_controller_default {
  constructor(service) {
    super();
    this.service = service;
  }
  getName() {
    return "invite";
  }
  create(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.create(client, body, requestId);
      response(result);
    });
  }
  cancel(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.cancel(client, body, requestId);
      response(result);
    });
  }
  accept(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.accept(client, body, requestId);
      response(result);
    });
  }
  decline(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.decline(client, body, requestId);
      response(result);
    });
  }
  read(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.read(client, body, requestId);
      response(result);
    });
  }
};
var invite_controller_default = InviteController;

// services/invite.service.ts
var InviteService = class {
  create(client, body, requestId) {
    return __async(this, null, function* () {
      var _a;
      let { granted, rights } = yield Guardian.authorize(client, body.towerId);
      if (granted) {
        let result = yield invite_exports.create(__spreadProps(__spreadValues({}, body), { senderId: client.humanId }));
        if (result.success) {
          (_a = network_default.instance.clients[body.targetHumanId]) == null ? void 0 : _a.emit(Updater.buildUpdate(requestId, Updater.types.invite.onCreate, result.invite));
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  cancel(client, body, requestId) {
    return __async(this, null, function* () {
      var _a;
      let { granted, rights } = yield Guardian.authorize(client, body.towerId);
      if (granted) {
        let result = yield invite_exports.cancel(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        if (result.success) {
          (_a = network_default.instance.clients[result.targetHumanId]) == null ? void 0 : _a.emit(Updater.buildUpdate(requestId, Updater.types.invite.onCancel, body.inviteId));
          delete result.targetHumanId;
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  decline(client, body, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        let result = yield invite_exports.decline(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        if (result.success) {
          result.adminIds.forEach((adminId) => {
            var _a;
            (_a = network_default.instance.clients[adminId]) == null ? void 0 : _a.emit(Updater.buildUpdate(requestId, Updater.types.invite.onDecline, body.inviteId));
          });
          delete result.adminIds;
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  accept(client, body, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        let result = yield invite_exports.accept(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        if (result.success) {
          result.tower.secret.adminIds.forEach((adminId) => {
            var _a;
            (_a = network_default.instance.clients[adminId]) == null ? void 0 : _a.emit(Updater.buildUpdate(requestId, Updater.types.invite.onAccept, body.inviteId));
          });
          Guardian.rules.addRule(result.member.towerId, result.member.humanId, result.member.secret.permissions);
          client.updateTowerId(result.member.towerId, result.member.secret.permissions);
          client.joinTower(result.member.towerId);
          result.tower = secureObject(result.tower, "secret");
          result.room = secureObject(result.room, "secret");
          result.rooms = result.rooms.map((room) => secureObject(room, "secret"));
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  read(client, body, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        return invite_exports.read({ humanId: client.humanId });
      } else {
        return { success: false };
      }
    });
  }
};
var invite_service_default = InviteService;

// controllers/permission.controller.ts
var PermissionController = class extends base_controller_default {
  constructor(service) {
    super();
    this.service = service;
  }
  getName() {
    return "permission";
  }
  update(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.update(client, body, requestId);
      response(result);
    });
  }
  read(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.read(client, body, requestId);
      response(result);
    });
  }
};
var permission_controller_default = PermissionController;

// services/permission.service.ts
var PermissionService = class {
  update(client, body, requestId) {
    return __async(this, null, function* () {
      var _a;
      let { granted, rights } = yield Guardian.authorize(client, body.towerId);
      if (granted) {
        let result = yield permission_exports.update(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        (_a = network_default.instance.clients[body.targetHumanId]) == null ? void 0 : _a.emit(Updater.buildUpdate(requestId, Updater.types.permission.onUpdate, body.permissions));
        return result;
      } else {
        return { success: false };
      }
    });
  }
  read(client, body, requestId) {
    return __async(this, null, function* () {
      let { granted, rights } = yield Guardian.authorize(client, body.towerId);
      if (granted) {
        return permission_exports.read(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
      } else {
        return { success: false };
      }
    });
  }
};
var permission_service_default = PermissionService;

// services/machine.service.ts
var MachineService = class {
  create(client, body, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        let result = yield machine_exports.create(__spreadProps(__spreadValues({}, body), { creatorId: client.humanId }));
        if (result.success) {
          yield memory_default.instance.save(`auth:${result.machine.secret.token}`, result.machine.id);
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  update(client, body, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        let result = yield machine_exports.update(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        return result;
      } else {
        return { success: false };
      }
    });
  }
  remove(client, body, requestId) {
    return __async(this, null, function* () {
      if (client.humanId) {
        let result = yield machine_exports.remove(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        if (result.success) {
          yield memory_default.instance.remove(`auth:${result.machine.secret.token}`);
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  search(client, body, requestId) {
    return __async(this, null, function* () {
      let result = yield machine_exports.search(__spreadValues({}, body));
      return result;
    });
  }
  read(client, body, requestId) {
    return __async(this, null, function* () {
      let result = yield machine_exports.read(__spreadValues({}, body));
      return result;
    });
  }
  signIn(client, body, requestId) {
    return __async(this, null, function* () {
      let { granted, humanId } = yield Guardian.authenticate(body.token);
      if (granted) {
        let result = yield machine_exports.signIn(humanId);
        client.updateHumanId(humanId);
        network_default.instance.keepClient(body.token, client);
        client.joinTowers(result.towerIds);
        return result;
      } else {
        return { success: false };
      }
    });
  }
};
var machine_service_default = MachineService;

// controllers/machine.controller.ts
var MachineController = class extends base_controller_default {
  constructor(service) {
    super();
    this.service = service;
  }
  getName() {
    return "machine";
  }
  create(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.create(client, body, requestId);
      response(result);
    });
  }
  update(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.update(client, body, requestId);
      response(result);
    });
  }
  remove(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.remove(client, body, requestId);
      response(result);
    });
  }
  search(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.search(client, body, requestId);
      response(result);
    });
  }
  read(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.read(client, body, requestId);
      response(result);
    });
  }
  signIn(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.signIn(client, body, requestId);
      response(result);
    });
  }
};
var machine_controller_default = MachineController;

// services/worker.service.ts
var WorkerService = class {
  constructor() {
    this.humanRequests = {};
  }
  create(client, body, requestId) {
    return __async(this, null, function* () {
      let { granted, rights } = yield Guardian.authorize(client, body.towerId);
      if (granted) {
        let result = yield worker_exports.create(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        if (result.success) {
          yield Promise.all([
            memory_default.instance.save(`worker:${body.roomId}:${body.machineId}`, true),
            memory_default.instance.save(`workerExtra:${body.roomId}:${result.worker.id}`, true),
            memory_default.instance.save(`machineWorker:${result.worker.id}`, body.machineId)
          ]);
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  update(client, body, requestId) {
    return __async(this, null, function* () {
      let { granted, rights } = yield Guardian.authorize(client, body.towerId);
      if (granted) {
        let result = yield worker_exports.update(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        return result;
      } else {
        return { success: false };
      }
    });
  }
  remove(client, body, requestId) {
    return __async(this, null, function* () {
      let { granted, rights } = yield Guardian.authorize(client, body.towerId);
      if (granted) {
        let result = yield worker_exports.remove(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
        if (result.success) {
          if (result.wasTheLast) {
            yield Promise.all([
              memory_default.instance.remove(`worker:${body.roomId}:${result.worker.machineId}`),
              memory_default.instance.remove(`workerExtra:${body.roomId}:${body.workerId}`),
              memory_default.instance.remove(`machineWorker:${result.worker.id}`)
            ]);
          } else {
            yield Promise.all([
              memory_default.instance.remove(`workerExtra:${body.roomId}:${body.workerId}`),
              memory_default.instance.remove(`machineWorker:${result.worker.id}`)
            ]);
          }
        }
        return result;
      } else {
        return { success: false };
      }
    });
  }
  read(client, body, requestId) {
    return __async(this, null, function* () {
      let result = yield worker_exports.read(__spreadProps(__spreadValues({}, body), { humanId: client.humanId }));
      return result;
    });
  }
  use(client, body, requestId) {
    return __async(this, null, function* () {
      var _a, _b;
      if (body.machineId) {
        this.humanRequests[client.humanId] = body.machineId;
        body.packet.humanId = client.humanId;
        (_a = network_default.instance.clients[body.machineId]) == null ? void 0 : _a.emit(Updater.buildUpdate(requestId, { category: "worker", key: "onRequest" }, body.packet));
        return { success: true };
      } else {
        let [res1, res2, res3] = yield Promise.all([
          memory_default.instance.fetch(`struct:${body.towerId}:${body.roomId}`),
          memory_default.instance.fetch(`workerExtra:${body.roomId}:${body.workerId}`),
          memory_default.instance.fetch(`machineWorker:${body.workerId}`)
        ]);
        if (res1 && res2) {
          body.packet.towerId = body.towerId;
          body.packet.roomId = body.roomId;
          body.packet.workerId = body.workerId;
          body.packet.humanId = client.humanId;
          (_b = network_default.instance.clients[res3]) == null ? void 0 : _b.emit(Updater.buildUpdate(requestId, { category: "worker", key: "onRequest" }, body.packet));
          return { success: true };
        } else {
          return { success: false };
        }
      }
    });
  }
  deliver(client, body, requestId) {
    return __async(this, null, function* () {
      var _a, _b;
      if (body.towerId) {
        if (body.humanId) {
          let [res1, res2, res3] = yield Promise.all([
            memory_default.instance.fetch(`struct:${body.towerId}:${body.roomId}`),
            memory_default.instance.fetch(`worker:${body.roomId}:${client.humanId}`),
            Guardian.rules.isRule(body.towerId, body.humanId)
          ]);
          if (res1 && res2 && res3) {
            body.packet.towerId = body.towerId;
            body.packet.roomId = body.roomId;
            body.packet.workerId = body.workerId;
            body.packet.humanId = body.humanId;
            (_a = network_default.instance.clients[body.humanId]) == null ? void 0 : _a.emit(Updater.buildUpdate(requestId, { category: "worker", key: "onResponse" }, body.packet));
            return { success: true };
          } else {
            return { success: false };
          }
        } else {
          let [res1, res2] = yield Promise.all([
            memory_default.instance.fetch(`struct:${body.towerId}:${body.roomId}`),
            memory_default.instance.fetch(`worker:${body.roomId}:${client.humanId}`)
          ]);
          if (res1 && res2) {
            body.packet.towerId = body.towerId;
            body.packet.roomId = body.roomId;
            body.packet.workerId = body.workerId;
            if (body.exceptionId) {
              let exception = network_default.instance.clients[body.exceptionId];
              if (exception) {
                network_default.instance.group(body.towerId).boradcast.emit(exception, Updater.buildUpdate(requestId, { category: "worker", key: "onResponse" }, body.packet));
              } else {
                network_default.instance.group(body.towerId).emit(Updater.buildUpdate(requestId, { category: "worker", key: "onResponse" }, body.packet));
              }
            } else {
              network_default.instance.group(body.towerId).emit(Updater.buildUpdate(requestId, { category: "worker", key: "onResponse" }, body.packet));
            }
            return { success: true };
          } else {
            return { success: false };
          }
        }
      } else {
        if (body.humanId) {
          if (this.humanRequests[body.humanId] === client.humanId) {
            body.packet.machineId = client.humanId;
            (_b = network_default.instance.clients[body.humanId]) == null ? void 0 : _b.emit(Updater.buildUpdate(requestId, { category: "worker", key: "onResponse" }, body.packet));
            return { success: true };
          } else {
            return { success: false };
          }
        } else {
          return { success: false };
        }
      }
    });
  }
};
var worker_service_default = WorkerService;

// controllers/worker.controller.ts
var WorkerController = class extends base_controller_default {
  constructor(service) {
    super();
    this.service = service;
  }
  getName() {
    return "worker";
  }
  create(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.create(client, body, requestId);
      response(result);
    });
  }
  update(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.update(client, body, requestId);
      response(result);
    });
  }
  remove(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.remove(client, body, requestId);
      response(result);
    });
  }
  use(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.use(client, body, requestId);
      response(result);
    });
  }
  deliver(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.deliver(client, body, requestId);
      response(result);
    });
  }
  read(client, body, requestId, response) {
    return __async(this, null, function* () {
      let result = yield this.service.read(client, body, requestId);
      response(result);
    });
  }
};
var worker_controller_default = WorkerController;

// controllers/index.ts
var build2 = (extending) => {
  network_default.instance.registerController(human_controller_default, human_service_default, { extending });
  network_default.instance.registerController(tower_controller_default, tower_service_default, { extending });
  network_default.instance.registerController(room_controller_default, room_service_default, { extending });
  network_default.instance.registerController(invite_controller_default, invite_service_default, { extending });
  network_default.instance.registerController(permission_controller_default, permission_service_default, { extending });
  network_default.instance.registerController(machine_controller_default, machine_service_default, { extending });
  network_default.instance.registerController(worker_controller_default, worker_service_default, { extending });
};

// sigma.ts
var Sigma = class {
  start() {
    return __async(this, null, function* () {
      return new Promise((resolve) => {
        database_default.initialize(() => {
          Guardian.initialize();
          memory_default.initialize();
          Updater.initialize();
          network_default.initialize(() => {
            build2(this.extendables);
            resolve();
          });
        });
      });
    });
  }
  shell(machines) {
    machines.forEach((machine) => {
      let controller = new custom_controller_default(machine.getName(), machine);
      network_default.instance.registerCustomController(controller);
    });
  }
  expressApp() {
    return network_default.instance.app;
  }
  httpServer() {
    return network_default.instance.server;
  }
  guardian() {
    return Guardian.instance;
  }
  updater() {
    return Updater.instance;
  }
  client(humanId) {
    return network_default.instance.clients[humanId];
  }
  service(serviceName) {
    return network_default.instance.services[serviceName];
  }
  constructor(conf) {
    setupConfig(conf);
    this.extendables = new Extendables();
  }
};
var sigma_default = Sigma;

// services/base.service.ts
var BaseService = class {
};
var base_service_default = BaseService;

// machines/base.machine.ts
var import_fs = __toESM(require("fs"));
var BaseMachine = class extends base_service_default {
  route(key, client, body) {
    return new Promise((resolve, reject) => __async(this, null, function* () {
      let action = this.getService();
      for (const element of key) {
        action = action[element];
      }
      if (action) {
        if (action.guardian.authenticate) {
          if (!client.humanId) {
            reject();
            return;
          }
        }
        let report = void 0;
        if (action.guardian.inRoom && !body["roomId"]) {
          reject();
          return;
        }
        if (action.guardian.authorize) {
          let result = yield Guardian.instance.authorize(client, body["towerId"], body["roomId"]);
          if (result == null ? void 0 : result.granted) {
            report = { towerId: body.towerId, rights: result.rights, roomId: result.roomId };
          } else {
            reject();
            return;
          }
        }
        resolve(action.func(client, body, {
          storage: {
            write: (relativePath, data) => __async(this, null, function* () {
              if (body.roomId) {
                let path = `${config_default.TEMP_STORAGE}/storage/${body.roomId}/${relativePath}`;
                let pathParts = path.split("/");
                pathParts.pop();
                yield import_fs.default.promises.mkdir(pathParts.join("/"), { recursive: true });
                yield import_fs.default.promises.writeFile(path, data, { flag: "a+" });
              }
            }),
            remove: (relativePath) => __async(this, null, function* () {
              if (body.roomId) {
                yield import_fs.default.promises.rm(`${config_default.TEMP_STORAGE}/storage/${body.roomId}/${relativePath}`);
              }
            })
          }
        }, report));
      } else {
        reject();
        return;
      }
    }));
  }
  routeRest(key, client, req, res) {
    return new Promise((resolve, reject) => __async(this, null, function* () {
      var _a;
      let action = this.getService();
      for (let i = 0; i < key.length; i++) {
        action = action[key[i]];
      }
      if (action) {
        if (action.guardian.authenticate) {
          if (!(client == null ? void 0 : client.humanId)) {
            reject(2);
            return;
          }
        }
        let report = void 0;
        if (action.guardian.inRoom && !req.headers["roomid"]) {
          reject(3);
          return;
        }
        if (action.guardian.authorize) {
          let result = yield Guardian.instance.authorize(client, (_a = req.headers["towerid"]) == null ? void 0 : _a.toString(), req.headers["roomid"].toString());
          if (result == null ? void 0 : result.granted) {
            report = { towerId: req.headers["towerid"].toString(), rights: result.rights, roomId: req.headers["roomid"].toString() };
          } else {
            reject(4);
            return;
          }
        }
        resolve(action.func(client, req, res, {
          storage: {
            write: (relativePath, data) => __async(this, null, function* () {
              if (req.headers["roomid"]) {
                let path = `${config_default.TEMP_STORAGE}/storage/${req.headers["roomid"].toString()}/${relativePath}`;
                let pathParts = path.split("/");
                pathParts.pop();
                yield import_fs.default.promises.mkdir(pathParts.join("/"), { recursive: true });
                yield import_fs.default.promises.writeFile(path, data, { flag: "a+" });
              }
            }),
            remove: (relativePath) => __async(this, null, function* () {
              if (req.headers["roomid"]) {
                yield import_fs.default.promises.rm(`${config_default.TEMP_STORAGE}/storage/${req.headers["roomid"].toString()}/${relativePath}`);
              }
            })
          }
        }, report));
      } else {
        reject(5);
        return;
      }
    }));
  }
};
var base_machine_default = BaseMachine;

// machines/utils/action.ts
var Action = class {
  constructor(guardian, func) {
    this.guardian = guardian;
    this.func = func;
  }
};
var action_default = Action;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Action,
  BaseMachine,
  Client,
  Sigma,
  Update,
  Updater
});
//# sourceMappingURL=index.js.map