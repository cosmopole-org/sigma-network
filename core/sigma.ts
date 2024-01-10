
import StorageDriver from "./database/index"
import NetworkDriver from "./drivers/network/network"
import MemoryDriver from "./drivers/memory/memory"
import * as Controllers from './controllers'
import CustomController from "./controllers/custom.controller"
import BaseMachine from "./machines/base.machine"
import { setupConfig } from "./config"
import updaterEngine from "updater"
import Extendables from "./extendables"
import { Express } from "express"
import { Server as HttpServer } from 'node:http';
import Guardian from "./guardian"

class Sigma {
    extendables: Extendables
    async start(): Promise<void> {
        return new Promise(resolve => {
            StorageDriver.initialize(() => {
                Guardian.initialize()
                MemoryDriver.initialize()
                updaterEngine.initialize()
                NetworkDriver.initialize(() => {
                    Controllers.build(this.extendables)
                    resolve()
                })
            })
        })
    }
    shell(machines: Array<BaseMachine>) {
        machines.forEach((machine: BaseMachine) => {
            let controller = new CustomController(machine.getName(), machine)
            NetworkDriver.instance.registerCustomController(controller)
        })
    }
    expressApp(): Express {
        return NetworkDriver.instance.app
    }
    httpServer(): HttpServer {
        return NetworkDriver.instance.server
    }
    guardian(): Guardian {
        return Guardian.instance
    }
    updater() {
        return updaterEngine.instance
    }
    client(humanId: string) {
        return NetworkDriver.instance.clients[humanId]
    }
    service(serviceName: string) {
        return NetworkDriver.instance.services[serviceName]
    }
    constructor(conf: any) {
        setupConfig(conf)
        this.extendables = new Extendables()
    }
}

export default Sigma
