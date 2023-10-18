import { Socket } from "socket.io";

class Client {

    socket: Socket
    isGuest: boolean
    humanId: string
    towerId: string

    public updateUserId(humanId: string) {
        this.humanId = humanId
    }

    public updateTowerId(towerId: string) {
        this.towerId = towerId
    }
    
    constructor(socket: Socket) {
        this.socket = socket
    }
}

export default Client
