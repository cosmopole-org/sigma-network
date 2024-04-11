
import mongoose, { ClientSession } from "mongoose";
import { Human } from "../schema/human.schema";
import { IHuman } from "models/human.model";

class HumanFactory {
    static _instnace: HumanFactory;
    static initialize(): HumanFactory {
        return new HumanFactory();
    }
    static get instance(): HumanFactory {
        return HumanFactory._instnace;
    }
    constructor() {
        HumanFactory._instnace = this;
    }
    async create(initData: IHuman, session: ClientSession): Promise<IHuman> {
        return (await Human.create([initData], { session }))[0].toObject();
    }
    async read(offset?: number, count?: number, query?: any): Promise<Array<IHuman>> {
        let cursor: mongoose.mongo.FindCursor;
        let collection = mongoose.connection.db.collection('Human');
        if (offset && count) {
            if ((await collection.count()) - offset >= 0) {
                cursor = collection.find(query ? query : {}).skip(offset).limit(count);
            } else {
                cursor = collection.find(query ? query : {}).skip(0).limit(count);
            }
        } else {
            cursor = collection.find(query ? query : {});
        }
        return await cursor.toArray();
    }
    async find(query: any, session?: ClientSession): Promise<IHuman> {
        if (session) {
            return await Human.findOne(query).session(session).lean().exec();
        } else {
            return await Human.findOne(query).lean().exec();
        }
    }
    async findGroup(query: any, session?: ClientSession): Promise<Array<IHuman>> {
        if (session) {
            return await Human.find(query).session(session).lean().exec();
        } else {
            return await Human.find(query).lean().exec();
        }
    }
    async update(query: any, update: any, session?: ClientSession): Promise<IHuman> {
        if (session) {
            return await Human.findOneAndUpdate(query, update, { new: true }).session(session).lean().exec();
        } else {
            return await Human.findOneAndUpdate(query, update, { new: true }).lean();
        }
    }
    async remove(query: any, session: ClientSession): Promise<void> {
        await Human.deleteOne(query).session(session);
    }
}

export default HumanFactory
