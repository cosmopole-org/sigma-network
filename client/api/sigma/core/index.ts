import Network from "../helpers/network";
import Storage from "../helpers/storage";
import Users from "../api/users";
import Security from "../helpers/security";

export default class Sigma {
    public net: Network = new Network()
    public store: Storage = new Storage()
    public security: Security = new Security(this.store)
    public services?: { users: Users } = undefined
    public async run() {
        await this.store.run();
        this.services = {
            users: new Users(this.net, this.store, this.security)
        }
    }
}
