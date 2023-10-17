
import mongoose from "mongoose";
import { Pending } from "../schema/pending.schema";

class PendingFactory {
    static inst;
    static initialize() {
        return new PendingFactory();
    }
    static instance() {
        return PendingFactory.inst;
    }
    constructor() {
        PendingFactory.inst = this;
    }
    async create(initData, session) {
        return (await Pending.create([initData], { session }))[0];
    }
    async read(offset, count, query) {
        let cursor;
        let collection = mongoose.connection.db.collection('Pending');
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
        return await cursor.toArray();
    }
    async find(query, session) {
        return await Pending.findOne(query).session(session).exec();
    }
    async findGroup(query, session) {
        return await Pending.find(query).session(session).exec();
    }
    async update(query, update, session) {
        await Pending.updateOne(query, update).session(session);
    }
    async remove(query, session) {
        await Pending.deleteOne(query).session(session);
    }
}

export default PendingFactory