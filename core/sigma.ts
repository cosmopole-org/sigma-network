
import StorageDriver from "./database/index"
import NetworkDriver from "./drivers/network/network"
import MemoryDriver from "./drivers/memory/memory"
import * as Controllers from './controllers'
import CustomController from "./controllers/custom.controller"
import BaseMachine from "./machines/base.machine"
import { setupConfig } from "./config"
import updaterEngine from "updater"
import { IRoom } from "models/room.model"
import { ClientSession } from "mongoose"
import guardian from "./guardian"

class Sigma {
    roomCreationCallback: (room: IRoom, mongoSession: ClientSession) => void
    onRoomCreation(callback: (room: IRoom, mongoSession: ClientSession) => void) {
        this.roomCreationCallback = callback
    }
    async start(): Promise<void> {
        return new Promise(resolve => {
            StorageDriver.initialize(() => {
                MemoryDriver.initialize()
                NetworkDriver.initialize()
                Controllers.build(this.roomCreationCallback)
                resolve()
            })
        })
    }
    shell(machines: Array<BaseMachine>) {
        machines.forEach((machine: BaseMachine) => {
            let controller = new CustomController(machine.getName(), machine)
            NetworkDriver.instance.registerCustomController(controller)
        })
    }
    core() {
        return NetworkDriver.instance.services
    }
    clients(humanId: string) {
        return NetworkDriver.instance.clients[humanId]
    }
    admin = {
        addMember: (towerId: string, humanId: string) => {
            return this.core()['tower']['addMember'](towerId, humanId)
        }
    }
    guardian = guardian
    updater = updaterEngine
    constructor(conf: any) {
        setupConfig(conf)
    }
}

export default Sigma
