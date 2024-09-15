import Api from "@/api";
import Network from "../helpers/network";
import Storage from "../helpers/storage";
import { Message } from "../models";

export default class Messages {
    private api: Api
    private net: Network
    private store: Storage
    constructor(api: Api, net: Network, store: Storage) {
        this.api = api;
        this.net = net;
        this.store = store;
    }
    async read(body: { topicId: string, offset: number, count: number }) {
        try {
            const { success, result } = await this.net.safelyRequest(2, "messages/read", "GET", body);
            if (success) {
                let messages = result.messages;
                messages.forEach((message: Message) => {
                    message.state = "sent";
                });
                this.store.db.messages.bulkUpsert(messages);
                return { success: true, data: { messages } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    async create(
        body: { spaceId: string, topicId: string, data: { text?: string } }
    ) {
        try {
            const previewId = Math.random().toString().substring(2) + "_" + Math.random().toString().substring(2);
            this.store.db.messages.insert({ authorId: this.store.myUserId, spaceId: body.spaceId, topicId: body.topicId, time: Date.now(), tag: "text", data: body.data, id: previewId });
            const { success, result } = await this.net.safelyRequest(2, "messages/create", "POST", body);
            if (success) {
                let message = result.message;
                let msg = await this.store.db.messages.findOne(previewId).exec();
                msg?.remove();
                message.state = "sent";
                this.store.db.messages.upsert(message);
                return { success: true, data: { message } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
}
