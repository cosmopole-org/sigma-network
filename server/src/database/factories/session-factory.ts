
import mongoose from "mongoose";
import { Session } from "../schema/session.schema";

class SessionFactory {
    static inst;
    static initialize() {
        return new SessionFactory();
    }
    static instance() {
        return SessionFactory.inst;
    }
    ModelName = 'Session';
    Model = Session
    constructor() {
        SessionFactory.inst = this;
    }
    async create(initData, session) {
        return (await this.Model.create([initData], { session }))[0];
    }
    async read(offset, count, query) {
        let cursor;
        let collection = mongoose.connection.db.collection(this.ModelName);
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
    async find(query, session) {
        return await this.Model.findOne(query).session(session).exec();
    }
    async findGroup(query, session) {
        return await this.Model.find(query).session(session).exec();
    }
    async update(query, update, session) {
        await this.Model.updateOne(query, update).session(session);
    }
    async remove(query, session) {
        await this.Model.deleteOne(query).session(session);
    }
}

export default SessionFactory