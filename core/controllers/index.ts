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
import Extending from "../extendables";

const build = (extending: Extending) => {
    NetworkDriver.instance.registerController(HumanController, HumanService, { extending })
    NetworkDriver.instance.registerController(TowerController, TowerService, { extending })
    NetworkDriver.instance.registerController(RoomController, RoomService, { extending })
    NetworkDriver.instance.registerController(InviteController, InviteService, { extending })
    NetworkDriver.instance.registerController(PermissionController, PermissionService, { extending })
    NetworkDriver.instance.registerController(MachineController, MachineService, { extending })
    NetworkDriver.instance.registerController(WorkerController, WorkerService, { extending })
}

export {
    build
}
