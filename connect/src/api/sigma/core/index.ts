import Network from "../helpers/network";
import Storage from "../helpers/storage";
import Users from "../api/users";
import Spaces from "../api/spaces";
import Topics from "../api/topics";
import Api from "@/api";

class Sigma {
    public store: Storage = new Storage()
    public net: Network = new Network(this.store)
    public services?: { users: Users, spaces: Spaces, topics: Topics } = undefined
    public async run(api: Api) {
        await this.store.run();
        this.services = {
            users: new Users(api, this.net, this.store),
            spaces: new Spaces(api, this.net, this.store),
            topics: new Topics(api, this.net, this.store),
        }
    }
}

export default Sigma;
