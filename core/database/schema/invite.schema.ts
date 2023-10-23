
import mongoose, { Schema } from "mongoose";
import { IInvite } from "models/invite.model";

const InviteSchema = new Schema<IInvite>({
    id: String,
    humanId: String,
    towerId: String
})

let Invite: mongoose.Model<IInvite>

let prepare = () => {
    Invite = mongoose.model<IInvite>('Invite', InviteSchema, 'Invite')
}

export { Invite, prepare }
