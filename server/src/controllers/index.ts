import HumanService from "../services/human.service";
import HumanController from "./human.controller";
import NetworkDriver from "../drivers/network/network";

let controllers = [
    {
        controller: HumanController,
        service: HumanService
    }
]

const build = () => {
    controllers.forEach(c => {
        NetworkDriver.instance.registerController(c.controller, c.service)
    })
}

export {
    build
}