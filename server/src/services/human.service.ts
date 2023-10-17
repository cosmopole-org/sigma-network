import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import { ClientSession } from "mongoose";
import MemoryDriver from "../drivers/memory/memory";

class HumanService {
    async signUp(client: Client, body: { email: string }, session?: ClientSession) {
        return transactions.signUp({ email: body.email }, session)
    }
    async signIn(client: Client, body: { token: string }, session?: ClientSession) {
        let userId = await MemoryDriver.instance.fetch(`auth:${body.token}`)
        await transactions.signIn({ userId }, session)
        return { status: 'success' }
    }
}

export default HumanService
