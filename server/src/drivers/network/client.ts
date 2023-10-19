import { Emitter } from "@socket.io/redis-emitter";
import { Socket } from "socket.io";

class Client {

    socket: Socket
    isGuest: boolean
    humanId: string
    towerId: string
    emitter: Emitter

    public updateUserId(humanId: string) {
        this.humanId = humanId
    }

    public updateTowerId(towerId: string) {
        this.towerId = towerId
    }

    public emit(update: any) {
        this.socket.emit('update', update)
    }

    public joinTower(towerId: string) { 
        this.emitter.socketsJoin(towerId)
    }

    public leaveTower(towerId: string) {
        this.emitter.socketsLeave(towerId)
    }

    public joinTowers(towerIds: Array<string>) { 
        this.emitter.socketsJoin(towerIds)
    }

    public leaveTowers(towerIds: Array<string>) {
        this.emitter.socketsLeave(towerIds)
    }
    
    constructor(socket: Socket, emitter: Emitter) {
        this.socket = socket
        this.emitter = emitter
    }
}

export default Client
