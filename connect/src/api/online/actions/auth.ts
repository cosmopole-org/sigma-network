import { Actions, States } from "@/api/offline/states";
import { request } from "@/api/utils/fetch";

class Auth {
    async login(username: string, name: string, secret: string) {
        const res = await request("users/create", {
            "username": username,
            "secret": secret,
            "name": name,
            "avatar": "0",
            "publicKey": "-"
        }, 1);
        let session = res.session;
        let user = res.user;
        Actions.saveToken(session.token);
        Actions.saveUserId(user.id);
        this.authenticate();
        return res;
    }
    async authenticate() {
        if (States.getToken().length === 0) return false;
        const res = await request("users/authenticate", {}, 1);
        let authenticated = res.authenticated as boolean;
        if (!authenticated) {
            Actions.saveToken("");
        }
        Actions.updateAuthenticated(true);
        return authenticated;
    }
}

export default Auth;
