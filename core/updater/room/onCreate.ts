import { IMember } from "models/member.model";
import Update from "../base";
import { IRoom } from "models/room.model";

class onRoomCreate extends Update {
    room: IRoom
    constructor(requestId: string, room: IRoom) {
        super(requestId)
        this.room = room
    }
}

export default onRoomCreate
