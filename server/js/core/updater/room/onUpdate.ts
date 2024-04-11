import Update from "../base";
import { IRoom } from "models/room.model";

class OnRoomUpdate extends Update {
    room: IRoom
    constructor(requestId: string, room: IRoom) {
        super(requestId)
        this.room = room
    }
}

export default OnRoomUpdate
