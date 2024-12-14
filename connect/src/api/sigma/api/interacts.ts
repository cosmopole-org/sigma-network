import Api from "@/api";
import Network from "../helpers/network";
import Storage from "../helpers/storage";
import { States } from "@/api/client/states";

export default class Interacts {
    private api: Api
    private net: Network
    private store: Storage
    constructor(api: Api, net: Network, store: Storage) {
        this.api = api;
        this.net = net;
        this.store = store;
    }
    async create(
        body: { userId: string }
    ) {
        try {
            const { success, result } = await this.net.safelyRequest(1, "interact/create", "POST", {
                "userId": body.userId
            });
            if (success) {
                let interaction = result.interaction;
                interaction.id = interaction.id.toString();
                let space = result.space;
                let topic = result.topic;
                let member = result.member;
                let parts = interaction.userIds.split("|");
                if (parts[0] === States.store.myUserId) {
                    interaction.userId = parts[1];
                } else {
                    interaction.userId = parts[0];
                }
                this.store.db.interactions.upsert(interaction);
                this.store.db.spaces.upsert(space);
                this.store.db.topics.upsert(topic);
                this.store.db.members.upsert(member);
                return { success: true, data: { space, topic, member, interaction } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    async read() {
        try {
            const { success, result } = await this.net.safelyRequest(1, "interact/read", "GET", {});
            if (success) {
                let interactions = result.interactions;
                interactions.forEach((interaction: any) => {
                    interaction.id = interaction.userId
                });
                this.store.db.interactions.bulkUpsert(interactions);
                return { success: true, data: { interactions } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
}
