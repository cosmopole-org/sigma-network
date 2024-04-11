import Update from "../base";

class OnPermissionUpdate extends Update {
    permissions: { [id: string]: boolean }
    constructor(requestId: string, permissions: { [id: string]: boolean }) {
        super(requestId)
        this.permissions = permissions
    }
}

export default OnPermissionUpdate
