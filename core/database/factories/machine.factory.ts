
import mongoose, { ClientSession } from "mongoose";
import { Machine } from "database/schema/machine.schema";
import { IMachine } from "models/machine.model";

class MachineFactory {
    static _instance: MachineFactory;
    static initialize(): MachineFactory {
        return new MachineFactory();
    }
    static get instance(): MachineFactory {
        return MachineFactory._instance;
    }
    constructor() {
        MachineFactory._instance = this;
    }
    async create(initData: IMachine, session: ClientSession): Promise<IMachine> {
        return (await Machine.create([initData], { session }))[0].toObject();
    }
    async read(offset?: number, count?: number, query?: any): Promise<Array<IMachine>> {
        let cursor: mongoose.mongo.FindCursor;
        let collection = mongoose.connection.db.collection('Machine');
        if ((await collection.count()) - offset >= 0) {
            cursor = collection.find(query ? query : {}).skip(offset).limit(count);
        } else {
            cursor = collection.find(query ? query : {}).skip(0).limit(count);
        }
        return await cursor.toArray();
    }
    async find(query: any, session: ClientSession): Promise<IMachine> {
        return await Machine.findOne(query).session(session).lean().exec();
    }
    async findGroup(query: any, session: ClientSession): Promise<Array<IMachine>> {
        return await Machine.find(query).session(session).lean().exec();
    }
    async update(query: any, update: any, session: ClientSession): Promise<IMachine> {
        return await Machine.findOneAndUpdate(query, update, { new: true }).session(session).lean();
    }
    async remove(query: any, session: ClientSession): Promise<void> {
        await Machine.deleteOne(query).session(session);
    }
}

export default MachineFactory
