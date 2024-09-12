import Auth from "./actions/auth";
import Space from "./actions/spaces";

class Services {
    auth: Auth
    spaces: Space
    constructor() {
        this.auth = new Auth();
        this.spaces = new Space();
    }
}

export default Services;
