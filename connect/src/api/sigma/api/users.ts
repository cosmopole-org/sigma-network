import { Actions } from "@/api/client/states";
import Network from "../helpers/network";
import Storage from "../helpers/storage";
import { User } from "../models";
import { genRandAvatar } from "@/api/utils";
import Api from "@/api";

export default class Users {
    private api: Api
    private net: Network
    private store: Storage
    constructor(api: Api, net: Network, store: Storage) {
        this.api = api;
        this.net = net;
        this.store = store;
    }
    public async authenticate() {
        try {
            if (this.store.token.length === 0) return { success: false, data: { error: "token is empty" } };
            const { success, result } = await this.net.safelyRequest(1, "users/authenticate", "POST", {});
            if (success) {
                return { success: true, data: { authenticated: result.authenticated } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    public async create(
        body: { username: string, secret: string, name: string }
    ):
        Promise<{ success: boolean, data?: { error?: string, user?: User } }> {
        try {
            let { success, result } = await this.net.safelyRequest(1, "users/create", "POST", { ...body, publicKey: "1234567890", avatar: genRandAvatar() });
            if (success) {
                await Promise.all([
                    this.store.db.users.upsert(result.user),
                    this.store.db.sessions.upsert(result.session)
                ]);
                this.store.saveMyUserId(result.user.id);
                this.store.saveToken(result.session.token);
                this.authenticate().then((res: any) => {
                    this.net.instantiate(async () => {
                        Actions.updateAuthenticated(true);
                        await this.api.loadData();
                        if ((await this.store.db.spaces.count().exec()) > 0) {
                            let space = await this.store.db.spaces.findOne().exec();
                            let topic = await this.store.db.topics.findOne({ selector: { spaceId: { $eq: space?.id } } }).exec();
                            if (space && topic) Actions.updatePos(space?.id, topic?.id);
                        }
                        Actions.updateAuthenticated(res.data.authenticated);
                        Actions.updateAuthStep("passed");
                    });
                });
                return { success: true, data: { user: result.user } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    public async get(
        body: { userId: string }
    ):
        Promise<{ success: boolean, data?: { error?: string, user?: User } }> {
        try {
            let { success, result } = await this.net.safelyRequest(1, "users/get", "GET", body);
            if (success) {
                this.store.db.users.upsert(result.user);
                return { success: true, data: { user: result.user } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    public async read(
        body: { typ: string }
    ):
        Promise<{ success: boolean, data?: { error?: string, users?: User[] } }> {
        try {
            let { success, result } = await this.net.safelyRequest(1, "users/read", "GET", body);
            if (success) {
                this.store.db.users.bulkUpsert(result.users);
                return { success: true, data: { users: result.users } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
}
