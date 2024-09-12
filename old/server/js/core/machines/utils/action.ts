import Client from "../../drivers/network/client"

class Action {
    guardian: {
        authenticate?: boolean,
        authorize?: boolean,
        inRoom?: boolean
    }
    func: any
    constructor(
        guardian: { authenticate?: boolean, authorize?: boolean, inRoom?: boolean },
        func: any
    ) {
        this.guardian = guardian
        this.func = func
    }
}

export default Action
