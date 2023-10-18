import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import { ClientSession } from "mongoose";
import MemoryDriver from "../drivers/memory/memory";

class HumanService {
    async signUp(client: Client, body: { email: string }) {
        return transactions.human.signUp(body)
    }
    async signIn(client: Client, body: { token: string }) {
        let humanId = await MemoryDriver.instance.fetch(`auth:${body.token}`)
        if (humanId) {
            await transactions.human.signIn({ humanId })
            client.updateUserId(humanId)
            return { success: true }
        } else {
            return { success: false }
        }
    }
    async verify(client: Client, body: { cCode: string, vCode: string }) {
        let result = await transactions.human.verify(body)
        if (result.success && result.human) {
            await MemoryDriver.instance.save(`auth:${result.session.token}`, result.human.id);
        }
        return result
    }
    async complete(client: Client, body: { cCode: string, firstName: string, lastName?: string }) {
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
    async readById(client: Client, body: { targetHumanId: string }) {
        return transactions.human.readById(body)
    }
    async search(client: Client, body: { query: string, offset?: number, count?: number }) {
        return transactions.human.search(body)
    }
    async signOut(client: Client) {
        if (client.humanId) {
            await transactions.human.signOut({ humanId: client.humanId })
            return { success: true }
        } else {
            return { success: false }
        }
    }
}

export default HumanService
