import HumanService from "../services/human.service";
import HumanController from "./human.controller";
import NetworkDriver from "../drivers/network/network";
import TowerController from "./tower.controller";
import TowerService from "../services/tower.service";
import RoomService from "../services/room.service";
import RoomController from "./room.controller";
import InviteController from "./invite.controller";
import InviteService from "../services/invite.service";
import PermissionController from "./permission.controller";
import PermissionService from "../services/permission.service";
import MachineService from "../services/machine.service";
import MachineController from "./machine.controller";
import WorkerService from "services/worker.service";
import WorkerController from "./worker.controller";

const build = () => {
    NetworkDriver.instance.registerController(HumanController, HumanService)
    NetworkDriver.instance.registerController(TowerController, TowerService)
    NetworkDriver.instance.registerController(RoomController, RoomService)
    NetworkDriver.instance.registerController(InviteController, InviteService)
    NetworkDriver.instance.registerController(PermissionController, PermissionService)
    NetworkDriver.instance.registerController(MachineController, MachineService)
    NetworkDriver.instance.registerController(WorkerController, WorkerService)
}

export {
    build
}
