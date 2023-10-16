
import mongoose, { Schema } from "mongoose";
import { IPending } from "src/models/pending.model";

const WorkerSchema = new Schema<IPending>({
    id: String,
    botId: String,
    workspaceId: String,
    secret: Schema.Types.Mixed
})

let Pending

let prepare = () => {
    Pending = mongoose.model<IPending>('Pending', WorkerSchema, 'Pending')
}

export { Pending, prepare }

