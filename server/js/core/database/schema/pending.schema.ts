
import mongoose, { Schema } from "mongoose";
import { IPending } from "../../models/pending.model";

const PendingSchema = new Schema<IPending>({
    cCode: { type: String, required: true },
    vCode: { type: String, required: true },
    email: { type: String, required: true },
    humanId: { type: String },
    progress: { type: String, required: true }
})

let Pending: mongoose.Model<IPending>

let prepare = () => {
    Pending = mongoose.model<IPending>('Pending', PendingSchema, 'Pending')
}

export { Pending, prepare }

