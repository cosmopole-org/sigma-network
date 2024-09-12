import Services from './online/services';

class Api {
    public static async load(): Promise<Api> {
        let a = new Api();
        await a.services.spaces.read();
        return a;
    }
    services: Services
    constructor() {
        this.services = new Services();
    }
}

export default Api;
