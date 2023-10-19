import Client from "../drivers/network/client"
import * as transactions from '../database/transactions/transactions'

class InviteService {
    async create(client: Client, body: { towerId: string, targetHumanId: string }) {
        if (client.humanId) {
            return transactions.invite.create({ ...body, senderId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async cancel(client: Client, body: { inviteId: string }) {
        if (client.humanId) {
            return transactions.invite.cancel({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async decline(client: Client, body: { inviteId: string }) {
        if (client.humanId) {
            return transactions.invite.decline({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async accept(client: Client, body: { inviteId: string }) {
        if (client.humanId) {
            return transactions.invite.accept({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
}

export default InviteService
