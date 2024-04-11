import Update from "../base";

class onWorkerResponse extends Update {
    packet: any
    constructor(requestId: string, packet: any) {
        super(requestId)
        this.packet = packet
    }
}

export default onWorkerResponse
