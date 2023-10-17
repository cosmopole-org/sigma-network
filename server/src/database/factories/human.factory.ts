
import mongoose, { ClientSession } from "mongoose";
import { Human } from "../schema/human.schema";
import { IHuman } from "src/models/human.model";

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
        return (await Human.create([initData], { session }))[0];
    }
    async read(offset?: number, count?: number, query?: any): Promise<Array<IHuman>> {
        let cursor: mongoose.mongo.FindCursor;
        let collection = mongoose.connection.db.collection('Human');
        if (offset && count && query) {
            if ((await collection.count()) - offset >= 0) {
                cursor = collection.find(query ? query : {}).skip(offset).limit(count);
            } else {
                cursor = collection.find(query ? query : {}).skip(0).limit(count);
            }
            return await cursor.toArray();
        } else {
            cursor = collection.find({});
        }
        return await cursor.toArray();
    }
    async find(query: any, session: ClientSession): Promise<IHuman> {
        if (session) {
            return await Human.findOne(query).session(session).exec();
        } else {
            return await Human.findOne(query).exec();
        }
    }
    async update(query: any, update: any, session?: ClientSession): Promise<IHuman> {
        if (session) {
            return await Human.findOneAndUpdate(query, update, { new: true }).session(session);
        } else {
            return await Human.findOneAndUpdate(query, update, { new: true });
        }
    }
    async remove(query: any, session: ClientSession): Promise<void> {
        await Human.deleteOne(query).session(session);
    }
}

export default HumanFactory
