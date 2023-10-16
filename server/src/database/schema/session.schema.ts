
import mongoose, { Schema } from "mongoose";
import { ISession } from "src/models/session.model";

const SessionSchema = new Schema<ISession>({
    id: String,
    token: String,
    userId: String
})

let Session

let prepare = () => {
    Session = mongoose.model<ISession>('Session', SessionSchema, 'Session')
}

export { Session, prepare }

