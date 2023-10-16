import mongoose, { Schema } from "mongoose";
import { IBot } from "src/models/bot.model";

const BotSchema = new Schema<IBot>({
    id: String,
    title: String,
    avatarId: String,
    secret: Schema.Types.Mixed
})

let Bot: mongoose.Model<IBot>

let prepare = () => {
    Bot = mongoose.model<IBot>('Bot', BotSchema, 'Bot')
}

export { Bot, prepare }
