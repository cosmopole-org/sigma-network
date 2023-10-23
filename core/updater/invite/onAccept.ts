import Update from "../base";

class OnInviteAccept extends Update {
    inviteId: string
    constructor(requestId: string, inviteId: string) {
        super(requestId)
        this.inviteId = inviteId
    }
}

export default OnInviteAccept
