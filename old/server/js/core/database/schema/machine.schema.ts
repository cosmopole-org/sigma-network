
import mongoose, { Schema } from "mongoose";
import { IMachine } from "../../models/machine.model";

const MachineSchema = new Schema<IMachine>({
    id: String,
    name: String,
    secret: Schema.Types.Mixed
})

let Machine: mongoose.Model<IMachine>

let prepare = () => {
    Machine = mongoose.model<IMachine>('Machine', MachineSchema, 'Machine')
}

export { Machine, prepare }
