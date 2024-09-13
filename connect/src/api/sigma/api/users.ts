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
                Actions.updateAuthenticated(true);
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
                    this.store.db.users.insert(result.user),
                    this.store.db.sessions.insert(result.session)
                ]);
                this.store.saveToken(result.session.token);
                this.authenticate().then(async (res: any) => {
                    await this.api.loadData();
                    Actions.updateAuthenticated(res.data.authenticated);
                    Actions.updateAuthStep("passed");
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
                return { success: true, data: { user: result.user } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
}
