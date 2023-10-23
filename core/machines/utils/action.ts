import Client from "../../drivers/network/client"

class Action {
    guardian: {
        authenticate: true,
        authorize: true
    }
    func: (client: Client, body: any, guardianReport?: { towerId: string, permissions: { [id: string]: boolean } }) => any
    constructor(
        guardian: { authenticate: true, authorize: true },
        func: (client: Client, body: any, guardianReport?: { towerId: string, permissions: { [id: string]: boolean } }) => any
    ) {
        this.guardian = guardian
        this.func = func
    }
}

export default Action
