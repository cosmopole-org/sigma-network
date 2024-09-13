import Api from "@/api";
import Network from "../helpers/network";
import Storage from "../helpers/storage";
import { genRandAvatar } from "@/api/utils";

export default class Spaces {
    private api: Api
    private net: Network
    private store: Storage
    constructor(api: Api, net: Network, store: Storage) {
        this.api = api;
        this.net = net;
        this.store = store;
    }
    async read() {
        try {
            const { success, result } = await this.net.safelyRequest(1, "spaces/read", "GET", {});
            if (success) {
                let spaces = result.spaces;
                this.store.db.spaces.bulkUpsert(spaces);
                return { success: true, data: { spaces } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    async create(
        body: { title: string, isPublic: boolean }
    ) {
        try {
            const { success, result } = await this.net.safelyRequest(1, "spaces/create", "POST", {
                "title": body.title,
                "avatar": genRandAvatar(),
                "isPublic": body.isPublic,
                "tag": body.title
            });
            if (success) {
                let space = result.space;
                let member = result.member;
                this.store.db.spaces.upsert(space);
                this.store.db.members.upsert(member);
                return { success: true, data: { space } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
}
