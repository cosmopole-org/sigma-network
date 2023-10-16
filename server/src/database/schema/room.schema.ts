
import mongoose, { Schema } from "mongoose";
import { IRoom } from "src/models/room.model";

const RoomSchema = new Schema<IRoom>({
    id: String,
    title: String,
    avatarId: String,
    towerId: String,
    floor: String,
    isPublic: Boolean,
    wallpaperId: String,
    secret: Schema.Types.Mixed
})

let Room

let prepare = () => {
    Room = mongoose.model<IRoom>('Room', RoomSchema, 'Room')
}

export { Room, prepare, IRoom }
