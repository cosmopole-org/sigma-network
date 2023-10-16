import Client from "src/network/client";
import * as transactions from '../database/transactions/transactions'

class HumanService {
    signUp(client: Client, body: { email: string }) {
        return transactions.signUp({ email: body.email })
    }
    signIn(client: Client, body: { userId: string }) {
        return transactions.signIn({ }, body.userId)
    }
}

export default HumanService
