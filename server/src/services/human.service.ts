import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import MemoryDriver from "../drivers/memory/memory";
import { secureObject } from "../utils/filter";
import NetworkDriver from "../drivers/network/network";

class HumanService {
    async signUp(client: Client, body: { email: string }, requestId: string) {
        return transactions.human.signUp(body)
    }
    async signIn(client: Client, body: { token: string }, requestId: string) {
        let humanId = await MemoryDriver.instance.fetch(`auth:${body.token}`)
        if (humanId) {
            let result = await transactions.human.signIn({ humanId })
            client.updateUserId(humanId)
            NetworkDriver.instance.keepClient(client)
            client.joinTowers(result.memberships.map(m => m.towerId))
            return { success: true }
        } else {
            return { success: false }
        }
    }
    async verify(client: Client, body: { cCode: string, vCode: string }, requestId: string) {
        let result = await transactions.human.verify(body)
        if (result.success && result.human) {
            result.towers = result.towers.map(tower => tower.secret.ownerId === result.human.id ? tower : secureObject(tower, 'secret'))
            result.allMemberships = result.allMemberships.map(m => m.humanId === result.human.id ? m : secureObject(m, 'secret'))
            await MemoryDriver.instance.save(`auth:${result.session.token}`, result.human.id);
        }
        return result
    }
    async complete(client: Client, body: { cCode: string, firstName: string, lastName?: string }, requestId: string) {
        let result = await transactions.human.complete(body)
        if (result.success) {
            await Promise.all([
                MemoryDriver.instance.save(`auth:${result.session.token}`, result.human.id),
                MemoryDriver.instance.save(
                    `rights:${result.member.towerId}/${result.member.humanId}`, JSON.stringify(result.member.secret.permissions)
                )
            ])
        }
        return result
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
            client.joinTowers(result.memberships.map(m => m.towerId))
            client.updateTowerId(undefined)
            client.updateUserId(undefined)
            return { success: true }
        } else {
            return { success: false }
        }
    }
}

export default HumanService
