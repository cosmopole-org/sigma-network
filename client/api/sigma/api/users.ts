import Network from "../helpers/network";
import Storage from "../helpers/storage";
import {User} from "../models";
import Security from "../helpers/security";

export default class Users {
    private net: Network
    private store: Storage
    private security: Security
    constructor(net: Network, store: Storage, security: Security) {
        this.net = net;
        this.store = store;
        this.security = security;
    }
    public async create(
        body: {username: string, secret: string, name: string, avatar: string }
    ):
        Promise<{ success: boolean, data?: {error?: string, user?: User} }>
    {
        let publicKey = await this.security.getMyPublicKey();
        let { success, result } = await this.net.safelyRequest(1, "users/create", "POST", {...body, publicKey});
        if (success) {
            await Promise.all([
                this.store.db.users.insert(result.user),
                this.store.db.sessions.insert(result.session)
            ]);
            return { success: true, data: { user: result.user } };
        } else {
            return { success: false, data: { error: result.toString() } };
        }
    }
    public async get(
        body: {userId: string }
    ):
        Promise<{ success: boolean, data?: {error?: string, user?: User} }> {
        let { success, result } = await this.net.safelyRequest(1, "users/get", "GET", body);
        if (success) {
            return { success: true, data: { user: result.user } };
        } else {
            return { success: false, data: { error: result.toString() } };
        }
    }
}
