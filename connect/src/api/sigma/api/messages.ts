import Api from "@/api";
import Network from "../helpers/network";
import Storage from "../helpers/storage";

export default class Messages {
    private api: Api
    private net: Network
    private store: Storage
    constructor(api: Api, net: Network, store: Storage) {
        this.api = api;
        this.net = net;
        this.store = store;
    }
    async read(body: { topicId: string, offset: number, count: number}) {
        try {
            const { success, result } = await this.net.safelyRequest(2, "messages/read", "GET", body);
            if (success) {
                let messages = result.messages;
                this.store.db.spaces.bulkUpsert(messages);
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
            const { success, result } = await this.net.safelyRequest(2, "messages/create", "POST", body);
            if (success) {
                let message = result.message;
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
