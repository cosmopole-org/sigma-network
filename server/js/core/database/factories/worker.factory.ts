
import mongoose, { ClientSession } from "mongoose";
import { IWorker } from "models/worker.model";
import { Worker } from "database/schema/worker.schema";

class WorkerFactory {
    static _instance: WorkerFactory;
    static initialize(): WorkerFactory {
        return new WorkerFactory();
    }
    static get instance(): WorkerFactory {
        return WorkerFactory._instance;
    }
    constructor() {
        WorkerFactory._instance = this;
    }
    async create(initData: IWorker, session: ClientSession): Promise<IWorker> {
        return (await Worker.create([initData], { session }))[0].toObject();
    }
    async update(query: any, update: any, session: ClientSession): Promise<IWorker> {
        return Worker.findOneAndUpdate(query, update, { new: true }).session(session).lean();
    }
    async replace(query: any, newOne: any, session: ClientSession): Promise<IWorker> {
        return Worker.findOneAndReplace(query, newOne, { new: true }).session(session).lean();
    }
    async read(query: any): Promise<Array<IWorker>> {
        let cursor: mongoose.mongo.FindCursor;
        let collection = mongoose.connection.db.collection('Worker');
        cursor = collection.find(query);
        return await cursor.toArray();
    }
    async find(query: any, session?: ClientSession): Promise<IWorker> {
        return Worker.findOne(query).session(session).lean().exec();
    }
    async remove(query: any, session: ClientSession): Promise<void> {
        await Worker.deleteOne(query).session(session);
    }
}

export default WorkerFactory
