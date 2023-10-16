
import mongoose, { Schema } from "mongoose";
import { IHuman } from "src/models/human.model";

const HumanSchema = new Schema<IHuman>({
    id: String,
    firstName: String,
    lastName: String,
    publicKey: String,
    lastSeen: Number,
    isGuest: Boolean,
    secret: Schema.Types.Mixed
})

let Human: mongoose.Model<IHuman>

let prepare = () => {
    Human = mongoose.model<IHuman>('Human', HumanSchema, 'Human')
}

export { Human, prepare }
