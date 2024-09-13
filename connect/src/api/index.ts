import Sigma from "./sigma";

class Api {
    public static async load(): Promise<Api> {
        let a = new Api();
        await a.sigma.run(a);
        return a;
    }
    sigma: Sigma
    constructor() {
        this.sigma = new Sigma();
    }
    async loadData() {
        await this.sigma.services?.spaces.read();
    }
}

export default Api;
