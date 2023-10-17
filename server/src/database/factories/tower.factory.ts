
import mongoose from "mongoose";
import { Tower } from "../schema/tower.schema";

class TowerFactory {
    static inst;
    static initialize() {
        return new TowerFactory();
    }
    static instance() {
        return TowerFactory.inst;
    }
    ModelName = 'Tower';
    Model = Tower
    constructor() {
        TowerFactory.inst = this;
    }
    async create(initData, session) {
        return (await this.Model.create([initData], { session }))[0];
    }
    async read(offset, count, query) {
        let cursor;
        let collection = mongoose.connection.db.collection(this.ModelName);
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

export default TowerFactory
