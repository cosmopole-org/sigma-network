import Client from "../../drivers/network/client"

class Action {
    guardian: {
        authenticate?: boolean,
        authorize?: boolean,
        inRoom?: boolean
    }
    func: (client: Client, body: any, control: any, guardianReport?: { towerId: string, permissions: { [id: string]: boolean }, roomId?: string }) => any
    constructor(
        guardian: { authenticate?: boolean, authorize?: boolean, inRoom?: boolean },
        func: (client: Client, body: any, control: any, guardianReport?: { towerId: string, permissions: { [id: string]: boolean }, roomId?: string }) => any
    ) {
        this.guardian = guardian
        this.func = func
    }
}

export default Action
