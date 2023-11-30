import { Emitter } from "@socket.io/redis-emitter";
import { Socket } from "socket.io";
import * as json from '../../utils/json'
import NetworkDriver from "./network";

class Client {

    socket: Socket
    isGuest: boolean
    humanId: string
    towerId: string
    rights: { [id: string]: boolean }
    emitter: Emitter
    token: string

    public reset() {
        this.updateToken(undefined)
        this.updateHumanId(undefined)
        this.updateTowerId(undefined, undefined)
    }

    public updateToken(token: string) {
        this.token = token
    }

    public updateHumanId(humanId: string) {
        this.humanId = humanId
    }

    public updateTowerId(towerId: string, rights: { [id: string]: boolean }) {
        this.towerId = towerId
        this.rights = rights
    }

    public emit(update: any) {
        this.socket.emit('update', JSON.parse(json.safeStringify(update)))
    }

    public joinTower(towerId: string) {
        this.socket.join(towerId)
    }

    public leaveTower(towerId: string) {
        this.socket.leave(towerId)
    }

    public joinTowers(towerIds: Array<string>) {
        this.socket.join(towerIds)
    }

    public leaveTowers(towerIds: Array<string>) {
        towerIds.forEach(towerId => this.leaveTower(towerId))
    }

    constructor(socket: Socket, emitter: Emitter) {
        this.socket = socket
        this.emitter = emitter
    }
}

export default Client
