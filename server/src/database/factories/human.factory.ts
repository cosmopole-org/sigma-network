
import mongoose, { ClientSession } from "mongoose";
import { Human } from "../schema/human.schema";
import { IHuman } from "src/models/human.model";

class HumanFactory {
    static _instnace: HumanFactory;
    static initialize() {
        return new HumanFactory();
    }
    static instance() {
        return HumanFactory._instnace;
    }
    constructor() {
        HumanFactory._instnace = this;
    }
    async create(initData: any, session: ClientSession): Promise<IHuman> {
        return (await Human.create([initData], { session }))[0];
    }
    async read(offset: number, count: number, query: any): Promise<Array<IHuman>> {
        let cursor: any;
        let collection = mongoose.connection.db.collection('Human');
        if (offset && count && query) {
            if ((await collection.count()) - offset >= 0) {
                if (query) {
                    cursor = collection.find(query).skip(offset).limit(count);
                } else {
                    cursor = collection.find({ isGuest: false }).skip(offset).limit(count);
                }
            } else {
                if (query) {
                    cursor = collection.find(query).skip(0).limit(count);
                } else {
                    cursor = collection.find({ isGuest: false }).skip(0).limit(count);
                }
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
    async findGroup(query: any, session: ClientSession): Promise<Array<IHuman>> {
        return await Human.find(query).session(session).exec();
    }
    async update(query: any, update: any, session?: ClientSession): Promise<IHuman> {
        if (session) {
            return await Human.findOneAndUpdate(query, update, { new: true }).session(session);
        } else {
            return await Human.findOneAndUpdate(query, update, { new: true });
        }
    }
    async remove(query: any, session: ClientSession) {
        await Human.deleteOne(query).session(session);
    }
}

export default HumanFactory
