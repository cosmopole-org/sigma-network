import { IMember } from "models/member.model";
import Update from "../base";

class onHumanJoin extends Update {
    member: IMember
    constructor(requestId: string, member: IMember) {
        super(requestId)
        this.member = member
    }
}

export default onHumanJoin
