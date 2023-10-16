
import UserController from "./controllers/human.controller"
import UserService from "./services/human.service"
import StorageDriver from "./database/index"
import NetworkDriver from "./drivers/network/network"

(async () => {
    StorageDriver.initialize()
    NetworkDriver
        .initialize()
        .registerController(UserController, UserService)
})()