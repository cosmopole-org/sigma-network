import HumanService from "../services/human.service";
import HumanController from "./human.controller";
import NetworkDriver from "../drivers/network/network";
import TowerController from "./tower.controller";
import TowerService from "../services/tower.service";
import RoomService from "../services/room.service";
import RoomController from "./room.controller";

const build = () => {
    NetworkDriver.instance.registerController(HumanController, HumanService)
    NetworkDriver.instance.registerController(TowerController, TowerService)
    NetworkDriver.instance.registerController(RoomController, RoomService)
}

export {
    build
}
