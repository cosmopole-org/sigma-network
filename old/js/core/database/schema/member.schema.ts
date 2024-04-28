
import mongoose, { Schema } from "mongoose";
import { IMember } from "models/member.model";

const MemberSchema = new Schema<IMember>({
    id: String,
    humanId: String,
    towerId: String,
    secret: Schema.Types.Mixed
})

let Member: mongoose.Model<IMember>

let prepare = () => {
    Member = mongoose.model<IMember>('Member', MemberSchema, 'Member')
}

export { Member, prepare }
