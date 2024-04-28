import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import MemoryDriver from "../drivers/memory/memory";
import { secureObject } from "../utils/filter";
import NetworkDriver from "../drivers/network/network";
import guardian from "../guardian";
import Extendables, { EntityTypes } from "../extendables";

class HumanService {
    extendables: Extendables
    constructor(meta: { extendables: Extendables }) {
        this.extendables = meta.extendables
    }
    async signUp(client: Client, body: { email: string }, requestId: string) {
        return transactions.human.signUp(body)
    }
    async signIn(client: Client, body: { token: string }, requestId: string) {
        let { humanId, granted } = await guardian.authenticate(body.token)
        if (granted) {
            let result = await transactions.human.signIn({ humanId })
            client.updateHumanId(humanId)
            client.updateToken(body.token)
            NetworkDriver.instance.keepClient(body.token, client)
            client.joinTowers(result.memberships.map(m => m.towerId))
            NetworkDriver.instance.lastSeens[humanId] = -1
            return { success: true }
        } else {
            return { success: false }
        }
    }
    async verify(client: Client, body: { cCode?: string, vCode?: string, accessToken?: string }, requestId: string) {
        let result = await transactions.human.verify(body)
        if (result.success && result.human) {
            result.towers = result.towers.map(tower => tower.secret.ownerId === result.human.id ? tower : secureObject(tower, 'secret'))
            await MemoryDriver.instance.save(`auth:${result.session.token}`, result.human.id);
        }
        return result
    }
    async complete(client: Client, body: { cCode: string, firstName: string, lastName?: string }, requestId: string) {
        let result = await transactions.human.complete({ ...body, creationCallback: this.extendables.store[EntityTypes.ROOM_CREATION] })
        if (result.success) {
            await Promise.all([
                MemoryDriver.instance.save(`auth:${result.session.token}`, result.human.id),
                MemoryDriver.instance.save(`struct:${result.tower.id}:${result.room.id}`, true),
                guardian.rules.addRule(result.member.towerId, result.member.humanId, result.member.secret.permissions)
            ])
        }
        return result
    }
    async update(client: Client, body: { firstName?: string, lastName?: string }, requestId: string) {
        if (client.humanId) {
            return transactions.human.update({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async readById(client: Client, body: { targetHumanId: string }, requestId: string) {
        let result = await transactions.human.readById(body)
        if (result.success && result.human) {
            result.human = { ...secureObject(result.human, 'secret'), lastseen: result.human.secret.lastSeen }
        }
        return result
    }
    async readGroupById(client: Client, body: { targetHumanIds: Array<string> }, requestId: string) {
        let result = await transactions.human.readGroupById(body)
        if (result.success && result.humans) {
            result.humans = result.humans.map(human => ({ ...secureObject(human, 'secret'), lastseen: human.secret.lastSeen }))
        }
        return result
    }
    async search(client: Client, body: { query: string, offset?: number, count?: number }, requestId: string) {
        let result = await transactions.human.search(body)
        if (result.success && result.humans)
            result.humans = result.humans.map(u => secureObject(u, 'secret'))
        return result
    }
    async signOut(client: Client, requestId: string) {
        if (client.humanId) {
            let result = await transactions.human.signOut({ humanId: client.humanId })
            NetworkDriver.instance.looseClient(client)
            client.leaveTowers(result.memberships.map(m => m.towerId))
            client.reset()
            return result
        } else {
            return { success: false }
        }
    }
    async lastSeens(client: Client, body: { humanIds: Array<string> }, requestId: string) {
        let lastSeensData = {}
        body.humanIds.forEach(humanId => {
            lastSeensData[humanId] = NetworkDriver.instance.lastSeens[humanId]
        })
        return { success: true, lastSeens: lastSeensData }
    }
}

export default HumanService
