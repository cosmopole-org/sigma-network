
import StorageDriver from "./database/index"
import NetworkDriver from "./drivers/network/network"
import MemoryDriver from "./drivers/memory/memory"
import * as Controllers from './controllers'

(async () => {
    StorageDriver.initialize(() => {
        MemoryDriver.initialize()
        NetworkDriver.initialize()
        Controllers.build()
    })
})()
