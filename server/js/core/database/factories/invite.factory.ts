
import mongoose, { ClientSession } from "mongoose";
import { Invite } from "../schema/invite.schema";
import { IInvite } from "models/invite.model";

class InviteFactory {
    static _instance: InviteFactory;
    static initialize(): InviteFactory {
        return new InviteFactory();
    }
    static get instance(): InviteFactory {
        return InviteFactory._instance;
    }
    constructor() {
        InviteFactory._instance = this;
    }
    async create(initData: IInvite, session: ClientSession): Promise<IInvite> {
        return (await Invite.create([initData], { session }))[0].toObject();
    }
    async read(query?: any, offset?: number, count?: number): Promise<Array<IInvite>> {
        let cursor: mongoose.mongo.FindCursor
        let collection = mongoose.connection.db.collection('Invite');
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
    async find(query: any, session?: ClientSession): Promise<IInvite> {
        if (session) {
            return await Invite.findOne(query).session(session).lean().exec();
        } else {
            return await Invite.findOne(query).lean().exec();
        }
    }
    async findGroup(query: any, session: ClientSession): Promise<Array<IInvite>> {
        return await Invite.find(query).session(session).lean().exec();
    }
    async update(query: any, update: any, session: ClientSession): Promise<IInvite> {
        return await Invite.findOneAndUpdate(query, update, { new: true }).session(session).lean();
    }
    async remove(query: any, session: ClientSession): Promise<void> {
        await Invite.deleteOne(query).session(session);
    }
}

export default InviteFactory
