import { IInvite } from "models/invite.model";
import Update from "../base";

class onInviteCreate extends Update {
    invite: IInvite
    constructor(requestId: string, invite: IInvite) {
        super(requestId)
        this.invite = invite
    }
}

export default onInviteCreate
