import { Socket } from "socket.io";

class Client {

    socket: Socket
    isGuest: boolean
    userId: string
    towerId: string

    public updateUserId(userId: string) {
        this.userId = userId
    }

    public updateTowerId(towerId: string) {
        this.towerId = towerId
    }
    
    constructor(socket: Socket) {
        this.socket = socket
    }
}

export default Client
