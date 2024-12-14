import Sigma from "./sigma";
import { Space } from "./sigma/models";

class Api {
    public static async load(): Promise<Api> {
        let a = new Api();
        await a.sigma.run(a);
        await a.loadData();
        return a;
    }
    sigma: Sigma
    constructor() {
        this.sigma = new Sigma();
    }
    async loadData() {
        try {
            let res = await this.sigma.services?.spaces.read();
            let ps: any = [];
            res?.data.spaces.forEach((space: Space) => {
                ps.push(this.sigma.services?.topics.read({ spaceId: space.id }));
            });
            await Promise.all(ps);
            await this.sigma.services?.interacts.read();
        } catch (ex) {
            console.log(ex);
        }
    }
}

export default Api;
