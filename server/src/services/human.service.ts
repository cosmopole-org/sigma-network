import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import { ClientSession } from "mongoose";
import MemoryDriver from "../drivers/memory/memory";

class HumanService {
    async signUp(client: Client, body: { email: string }, session?: ClientSession) {
        return transactions.human.signUp(body, session)
    }
    async signIn(client: Client, body: { token: string }, session?: ClientSession) {
        let humanId = await MemoryDriver.instance.fetch(`auth:${body.token}`)
        if (humanId) {
            await transactions.human.signIn({ humanId }, session)
            client.updateUserId(humanId)
            return { success: true }
        } else {
            return { success: false }
        }
    }
    async verify(client: Client, body: { cCode: string, vCode: string }, session?: ClientSession) {
        let result = await transactions.human.verify(body, session)
        console.log(result)
        if (result.success && result.human) {
            await MemoryDriver.instance.save(`auth:${result.session.token}`, result.human.id);
        }
        return result
    }
    async complete(client: Client, body: { cCode: string, firstName: string, lastName?: string }, session?: ClientSession) {
        let result = await transactions.human.complete(body, session)
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
    async readById(client: Client, body: { targetHumanId: string }, session?: ClientSession) {
        return transactions.human.readById(body, session)
    }
}

export default HumanService
