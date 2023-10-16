
import UserController from "./models/primary/human/human.controller"
import UserService from "./services/human.service"
import StorageDriver from "./database/index"
import NetworkDriver from "./network/network"

(async () => {
    StorageDriver.initialize()
    NetworkDriver
        .initialize()
        .registerController(UserController, UserService)
})()