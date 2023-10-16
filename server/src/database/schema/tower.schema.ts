
import mongoose, { Schema } from "mongoose";
import { ITower } from "src/models/tower.model";

const TowerSchema = new Schema<ITower>({
    id: String,
    title: String,
    avatarId: String,
    isPublic: Boolean,
    secret: Schema.Types.Mixed
})

let Tower

let prepare = () => {
    Tower = mongoose.model<ITower>('Tower', TowerSchema, 'Tower')
}

export { Tower, prepare }
