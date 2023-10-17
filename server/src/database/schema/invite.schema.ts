
import mongoose, { Schema } from "mongoose";
import { IInvite } from "src/models/invite.model";

const InviteSchema = new Schema<IInvite>({
    id: String,
    userId: String,
    roomId: String,
    title: String,
    text: String
})

let Invite: mongoose.Model<IInvite>

let prepare = () => {
    Invite = mongoose.model<IInvite>('Invite', InviteSchema, 'Invite')
}

export { Invite, prepare }
