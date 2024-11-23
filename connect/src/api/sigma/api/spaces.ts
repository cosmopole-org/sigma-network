import Api from "@/api";
import Network from "../helpers/network";
import Storage from "../helpers/storage";
import { genRandAvatar } from "@/api/utils";
import { MemberUser } from "../models";

export default class Spaces {
    private api: Api
    private net: Network
    private store: Storage
    constructor(api: Api, net: Network, store: Storage) {
        this.api = api;
        this.net = net;
        this.store = store;
    }
    async read() {
        try {
            const { success, result } = await this.net.safelyRequest(1, "spaces/read", "GET", {});
            if (success) {
                let spaces = result.spaces;
                this.store.db.spaces.bulkUpsert(spaces);
                return { success: true, data: { spaces } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    async readMembers(body: { spaceId: string }) {
        try {
            const { success, result } = await this.net.safelyRequest(1, "spaces/readMembers", "GET", {
                spaceId: body.spaceId
            });
            if (success) {
                let members = result.members;
                await this.store.db.users.bulkUpsert(members.map((m: MemberUser) => m.user));
                await this.store.db.members.bulkUpsert(members.map((m: MemberUser) => m.member));
                return { success: true, data: { members } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    async createMember(
        body: { userId: string, spaceId: string, metadata: string }
    ) {
        try {
            const { success, result } = await this.net.safelyRequest(1, "spaces/addMember", "POST", {
                "userId": body.userId,
                "spaceId": body.spaceId,
                "metadata": body.metadata
            });
            if (success) {
                let member = result.member;
                await this.store.db.members.upsert(member);
                return { success: true, data: { member } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    async updateMember(
        body: { memberId: string, spaceId: string, topicId: string, metadata: string }
    ) {
        try {
            const { success, result } = await this.net.safelyRequest(1, "spaces/updateMember", "POST", {
                "memberId": body.memberId,
                "spaceId": body.spaceId,
                "topicId": body.topicId,
                "metadata": body.metadata
            });
            if (success) {
                let member = result.member;
                await this.store.db.members.upsert(member);
                return { success: true, data: { member } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    async removeMember(
        body: { memberId: string, spaceId: string }
    ) {
        try {
            const { success, result } = await this.net.safelyRequest(1, "spaces/removeMember", "POST", {
                "memberId": body.memberId,
                "spaceId": body.spaceId,
                "topicId": "*"
            });
            if (success) {
                let member = await this.store.db.members.findOne({ selector: { id: { $eq: body.memberId } } }).exec();
                member?.remove();
                return { success: true };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
    async create(
        body: { title: string, isPublic: boolean }
    ) {
        try {
            const { success, result } = await this.net.safelyRequest(1, "spaces/create", "POST", {
                "title": body.title,
                "avatar": genRandAvatar(),
                "isPublic": true,
                "tag": body.title
            });
            if (success) {
                let space = result.space;
                let member = result.member;
                this.store.db.spaces.upsert(space);
                this.store.db.members.upsert(member);
                return { success: true, data: { space } };
            } else {
                return { success: false, data: { error: result.toString() } };
            }
        } catch (ex: any) {
            return { success: false, data: { error: ex.toString() } };
        }
    }
}
