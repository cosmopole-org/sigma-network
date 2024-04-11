
import mongoose, { ClientSession } from "mongoose";
import { Tower } from "../schema/tower.schema";
import { ITower } from "models/tower.model";

class TowerFactory {
    static _instance: TowerFactory;
    static initialize(): TowerFactory {
        return new TowerFactory();
    }
    static get instance(): TowerFactory {
        return TowerFactory._instance;
    }
    constructor() {
        TowerFactory._instance = this;
    }
    async create(initData: ITower, session: ClientSession): Promise<ITower> {
        return (await Tower.create([initData], { session }))[0].toObject();
    }
    async read(offset?: number, count?: number, query?: any): Promise<Array<ITower>> {
        let cursor: mongoose.mongo.FindCursor;
        let collection = mongoose.connection.db.collection('Tower');
        if ((await collection.count()) - offset >= 0) {
            cursor = collection.find(query ? query : {}).skip(offset).limit(count);
        } else {
            cursor = collection.find(query ? query : {}).skip(0).limit(count);
        }
        return await cursor.toArray();
    }
    async find(query: any, session: ClientSession): Promise<ITower> {
        return await Tower.findOne(query).session(session).lean().exec();
    }
    async findGroup(query: any, session?: ClientSession): Promise<Array<ITower>> {
        if (session) {
            return await Tower.find(query).session(session).lean().exec();
        } else {
            return await Tower.find(query).lean().exec();
        }
    }
    async update(query: any, update: any, session: ClientSession): Promise<ITower> {
        return await Tower.findOneAndUpdate(query, update, { new: true }).session(session).lean();
    }
    async remove(query: any, session: ClientSession): Promise<void> {
        await Tower.deleteOne(query).session(session);
    }
}

export default TowerFactory
