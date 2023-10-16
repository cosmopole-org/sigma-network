
import mongoose, { ClientSession } from 'mongoose';
import { Member } from '../schema/member.schema'
import { IMember } from 'src/models/member.model';

class MemberFactory {
    static _instance: MemberFactory;
    static initialize() : MemberFactory {
        return new MemberFactory();
    }
    static instance(): MemberFactory {
        return MemberFactory._instance;
    }
    constructor() {
        MemberFactory._instance = this;
    }
    async create(initData: any, session: ClientSession): Promise<IMember> {
        return (await Member.create([initData], { session }))[0];
    }
    async read(offset: number, count: number, query: any): Promise<Array<IMember>> {
        let cursor: any;
        let collection = mongoose.connection.db.collection('Member');
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
            return await cursor.toArray();
        } else {
            cursor = collection.find({});
        }
        return await cursor.toArray();
    }
    async find(query: any, session: ClientSession): Promise<IMember> {
        return await Member.findOne(query).session(session).exec();
    }
    async findGroup(query: any, session: ClientSession): Promise<Array<IMember>> {
        if (session) {
            return await Member.find(query).session(session).exec();
        } else {
            return await Member.find(query).exec();
        }
    }
    async update(query: any, update: any, session: ClientSession) : Promise<IMember> {
        return await Member.findOneAndUpdate(query, update, { new: true }).session(session);
    }
    async remove(query: any, session: ClientSession) {
        await Member.deleteOne(query).session(session);
    }
}

export default MemberFactory

