import { ITower } from "../../models/tower.model";
import Update from "../base";

class OnTowerRemove extends Update {
    tower: ITower
    constructor(requestId: string, tower: ITower) {
        super(requestId)
        this.tower = tower
    }
}

export default OnTowerRemove
