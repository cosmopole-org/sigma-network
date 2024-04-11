import * as HumanSchema from "./human.schema"
import * as BotSchema from "./bot.schema"
import * as InviteSchema from "./invite.schema"
import * as MemberSchema from "./member.schema"
import * as RoomSchema from "./room.schema"
import * as TowerSchema from "./tower.schema"
import * as WorkerSchema from "./worker.schema"
import * as PendingSchema from "./pending.schema"
import * as SessionSchema from "./session.schema"
import * as MachineSchema from './machine.schema'

let build = () => {
    PendingSchema.prepare()
    SessionSchema.prepare()
    HumanSchema.prepare()
    BotSchema.prepare()
    InviteSchema.prepare()
    MemberSchema.prepare()
    RoomSchema.prepare()
    TowerSchema.prepare()
    MachineSchema.prepare()
    WorkerSchema.prepare()
}

export {
    build,
    HumanSchema,
    BotSchema,
    InviteSchema,
    MemberSchema,
    PendingSchema,
    RoomSchema,
    SessionSchema,
    TowerSchema,
    WorkerSchema,
    MachineSchema
}