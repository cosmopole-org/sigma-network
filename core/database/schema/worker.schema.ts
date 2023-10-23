
import mongoose, { Schema } from "mongoose";
import { IWorker } from "models/worker.model";

const WorkerSchema = new Schema<IWorker>({
    id: String,
    botId: String,
    workspaceId: String,
    secret: Schema.Types.Mixed
})

let Worker

let prepare = () => {
    Worker = mongoose.model<IWorker>('Worker', WorkerSchema, 'Worker')
}

export { Worker, prepare }
