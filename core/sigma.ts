
import StorageDriver from "./database/index"
import NetworkDriver from "./drivers/network/network"
import MemoryDriver from "./drivers/memory/memory"
import * as Controllers from './controllers'
import CustomController from "./controllers/custom.controller"
import BaseMachine from "./machines/base.machine"
import { setupConfig } from "./config"
import mongoose from "mongoose"

class Sigma {
    async start(): Promise<void> {
        return new Promise(resolve => {
            StorageDriver.initialize(() => {
                MemoryDriver.initialize()
                NetworkDriver.initialize()
                Controllers.build()
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
    constructor(conf: any) {
        setupConfig(conf)
    }
}

export default Sigma
