
import mongoose, { ClientSession } from "mongoose";
import { Session } from "../schema/session.schema";
import { ISession } from "models/session.model";

class SessionFactory {
    static _instance;
    static initialize() : SessionFactory {
        return new SessionFactory();
    }
    static get instance() : SessionFactory {
        return SessionFactory._instance;
    }
    constructor() {
        SessionFactory._instance = this;
    }
    async create(initData: ISession, session: ClientSession) {
        return (await Session.create([initData], { session }))[0].toObject();
    }
    async read(offset?: number, count?: number, query?: any) {
        let cursor;
        let collection = mongoose.connection.db.collection('Session');
        if (offset && count && query) {
            if ((await collection.count()) - offset >= 0) {
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
        return await cursor.toArray();
    }
    async find(query: any, session: ClientSession) {
        return await Session.findOne(query).session(session).lean().exec();
    }
    async findGroup(query: any, session: ClientSession) {
        return await Session.find(query).session(session).lean().exec();
    }
    async update(query: any, update: any, session: ClientSession) {
        await Session.findOneAndUpdate(query, update, { new: true }).session(session).lean();
    }
    async remove(query: any, session: ClientSession): Promise<void> {
        await Session.deleteOne(query).session(session);
    }
}

export default SessionFactory