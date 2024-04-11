
import { IRoom } from "models/room.model";
import Update from "../base";

class OnRoomRemove extends Update {
    room: IRoom
    constructor(requestId: string, room: IRoom) {
        super(requestId)
        this.room = room
    }
}

export default OnRoomRemove
