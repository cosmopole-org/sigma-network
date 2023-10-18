import HumanService from "../services/human.service";
import HumanController from "./human.controller";
import NetworkDriver from "../drivers/network/network";
import TowerController from "./tower.controller";
import TowerService from "../services/tower.service";

const build = () => {
    NetworkDriver.instance.registerController(HumanController, HumanService)
    NetworkDriver.instance.registerController(TowerController, TowerService)
}

export {
    build
}
