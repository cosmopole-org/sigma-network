import { ITower } from "models/tower.model";
import Update from "../base";

class OnTowerUpdate extends Update {
    tower: ITower
    constructor(requestId: string, tower: ITower) {
        super(requestId)
        this.tower = tower
    }
}

export default OnTowerUpdate
