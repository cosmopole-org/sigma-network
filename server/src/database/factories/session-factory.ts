
import mongoose, { ClientSession } from "mongoose";
import { Session } from "../schema/session.schema";

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
    async create(initData: any, session: ClientSession) {
        return (await Session.create([initData], { session }))[0];
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
        return await Session.findOne(query).session(session).exec();
    }
    async findGroup(query: any, session: ClientSession) {
        return await Session.find(query).session(session).exec();
    }
    async update(query: any, update: any, session: ClientSession) {
        await Session.updateOne(query, update).session(session);
    }
    async remove(query: any, session: ClientSession) {
        await Session.deleteOne(query).session(session);
    }
}

export default SessionFactory