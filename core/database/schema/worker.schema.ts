
import mongoose, { Schema } from "mongoose";
import { IWorker } from "models/worker.model";
import flat from 'flat'

const WorkerSchema = new Schema<IWorker>({
    id: String,
    machineId: String,
    roomId: String,
    secret: Schema.Types.Mixed
})

let Worker: mongoose.Model<IWorker>

let prepare = () => {
    Worker = mongoose.model<IWorker>('Worker', WorkerSchema, 'Worker')
}

export { Worker, prepare }
