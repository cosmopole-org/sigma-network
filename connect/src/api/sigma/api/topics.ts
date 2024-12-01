import Api from "@/api";
import Network from "../helpers/network";
import Storage from "../helpers/storage";
import { genRandAvatar } from "@/api/utils";
import { randEmoji } from "@/api/client/constants";

export default class Topics {
    private api: Api
    private net: Network
    private store: Storage
    constructor(api: Api, net: Network, store: Storage) {
        this.api = api;
        this.net = net;
        this.store = store;
    }
    onPacketReceive(fn: (data: any) => void) {
        return this.net.addWsEvent('topics/send', fn);
    }
    async read(body: { spaceId: string }) {
        try {
            const { success, result } = await this.net.safelyRequest(1, "topics/read", "GET", body);
            if (success) {
                let topics = result.topics;
                this.store.db.topics.bulkUpsert(topics);
                return { success: true, data: { topics } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    async create(
        body: { title: string, spaceId: string }
    ) {
        try {
            const { success, result } = await this.net.safelyRequest(1, "topics/create", "POST", {
                "title": randEmoji() + " " + body.title,
                "avatar": genRandAvatar(),
                "spaceId": body.spaceId,
                "metadata": "{}"
            });
            if (success) {
                let topic = result.topic;
                this.store.db.topics.upsert(topic);
                return { success: true, data: { topic } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    async send(
        body: { type: string, recvId: string, memberId: string, spaceId: string, topicId: string, data: any }
    ) {
        try {
            const { success } = await this.net.safelyRequest(1, "topics/send", "POST", {
                "type": body.type,
                "data": JSON.stringify(body.data),
                "recvId": body.recvId,
                "spaceId": body.spaceId,
                "topicId": body.topicId,
                "memberId": body.memberId
            });
            return { success };
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    async ask(
        body: { recvId: string, spaceId: string, topicId: string, data: any }
    ) {
        try {
            let member = await this.store.db.collections.members.findOne({ selector: { userId: { $eq: this.store.myUserId }, spaceId: { $eq: body.spaceId } } }).exec();
            if (member === null) {
                return { success: false, data: { error: "member not found" } };    
            }
            return await this.send({ data: body.data, spaceId: body.spaceId, topicId: body.topicId, memberId: member.id, type: 'single', recvId: body.recvId });
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
}
