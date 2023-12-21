
import mongoose, { ClientSession } from "mongoose";
import { IRoom, Room } from "../schema/room.schema";

class RoomFactory {
    static _instance: RoomFactory;
    static initialize(): RoomFactory {
        return new RoomFactory();
    }
    static get instance(): RoomFactory {
        return RoomFactory._instance;
    }
    constructor() {
        RoomFactory._instance = this;
    }
    async create(initData: IRoom, session: ClientSession): Promise<IRoom> {
        return (await Room.create([initData], { session }))[0].toObject();
    }
    async read(offset?: number, count?: number, query?: any): Promise<Array<IRoom>> {
        let cursor: mongoose.mongo.FindCursor
        let collection = mongoose.connection.db.collection('Room');
        if ((await collection.count()) - offset >= 0) {
            cursor = collection.find(query ? query : {}).skip(offset).limit(count);
        } else {
            cursor = collection.find(query ? query : {}).skip(0).limit(count);
        }
        return await cursor.toArray();
    }
    async find(query: any, session: ClientSession): Promise<IRoom> {
        return await Room.findOne(query).session(session).lean().exec();
    }
    async findGroup(query: any, session?: ClientSession) : Promise<Array<IRoom>> {
        if (session) {
            return await Room.find(query).session(session).lean().exec();
        } else {
            return await Room.find(query).lean().exec();
        }
    }
    async update(query: any, update: any, session: ClientSession): Promise<IRoom> {
        return await Room.findOneAndUpdate(query, update, { new: true }).session(session).lean();
    }
    async remove(query: any, session: ClientSession): Promise<void> {
        await Room.deleteOne(query).session(session);
    }
}

export default RoomFactory