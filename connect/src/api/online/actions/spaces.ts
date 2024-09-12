import { Actions } from "@/api/offline/states";
import { request } from "@/api/utils/fetch";

class Space {
    async read() {
        const res = await request("spaces/read", {}, 1);
        let spaces = res.spaces;
        Actions.updateSpaces(spaces);
        return res;
    }
}

export default Space;
