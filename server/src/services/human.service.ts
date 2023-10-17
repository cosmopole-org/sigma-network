import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import { ClientSession } from "mongoose";
import MemoryDriver from "../drivers/memory/memory";

class HumanService {
    async signUp(client: Client, body: { email: string }, session?: ClientSession) {
        return transactions.human.signUp(body, session)
    }
    async signIn(client: Client, body: { token: string }, session?: ClientSession) {
        let userId = await MemoryDriver.instance.fetch(`auth:${body.token}`)
        await transactions.human.signIn({ userId }, session)
        return { status: 'success' }
    }
    async verify(client: Client, body: { cCode: string, vCode: string }, session?: ClientSession) {
        return transactions.human.verify(body, session)
    }
}

export default HumanService
