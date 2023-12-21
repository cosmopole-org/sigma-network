
import mongoose, { ClientSession } from "mongoose";
import { Pending } from "../schema/pending.schema";
import { IPending } from "models/pending.model";

class PendingFactory {
    static _instance: PendingFactory;
    static initialize(): PendingFactory {
        return new PendingFactory();
    }
    static get instance(): PendingFactory {
        return PendingFactory._instance;
    }
    constructor() {
        PendingFactory._instance = this;
    }
    async create(initData: IPending, session: ClientSession): Promise<IPending> {
        return (await Pending.create([initData], { session }))[0].toObject();
    }
    async read(offset: number, count: number, query: any): Promise<Array<IPending>> {
        let cursor: mongoose.mongo.FindCursor;
        let collection = mongoose.connection.db.collection('Pending');
        if ((await collection.count()) - offset >= 0) {
            cursor = collection.find(query ? query : {}).skip(offset).limit(count);
        } else {
            cursor = collection.find(query ? query : {}).skip(0).limit(count);
        }
        return await cursor.toArray();
    }
    async find(query: any, session: ClientSession): Promise<IPending> {
        return await Pending.findOne(query).session(session).lean().exec();
    }
    async findGroup(query: any, session: ClientSession): Promise<Array<IPending>> {
        return await Pending.find(query).session(session).lean().exec();
    }
    async update(query: any, update: any, session: ClientSession): Promise<IPending> {
        return await Pending.findOneAndUpdate(query, update, { new: true }).session(session).lean();
    }
    async remove(query: any, session: ClientSession): Promise<void> {
        await Pending.deleteOne(query).session(session);
    }
}

export default PendingFactory
