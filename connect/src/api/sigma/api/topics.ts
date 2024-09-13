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
}
