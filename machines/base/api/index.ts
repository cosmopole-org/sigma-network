import { NetworkDriver } from "./drivers";
import * as Services from "./services";

class Api {
    
    public static async initilize(token: string): Promise<Api> {
        return new Promise(resolve => {
            let api = new Api(token)
            resolve(api)
        })
    }

    network: NetworkDriver
    services: {
        machine: Services.MachineService,

    }
    memory: {
        myMachineId: any,
        spaces: { [id: string]: any },
    }

    constructor(token: string) {
        let myMachineId: string | undefined = undefined
        let spaces: { [id: string]: any } = {}
        this.memory = {
            myMachineId,
            spaces: spaces,
        }
        this.network = new NetworkDriver(this, token)
        this.services = {
            machine: new Services.MachineService(this.network, this.memory),
        }
    }
}

export default Api
