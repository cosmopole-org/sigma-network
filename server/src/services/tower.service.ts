import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'

class TowerService {
    async create(client: Client, body: { title: string, avatarId: string, isPublic: boolean }) {
        if (client.humanId) {
            return transactions.tower.create({ ...body, ownerId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async update(client: Client, body: { towerId: string, title: string, avatarId: string, isPublic: boolean }) {
        if (client.humanId) {
            return transactions.tower.update({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async remove(client: Client, body: { towerId: string }) {
        if (client.humanId) {
            return transactions.tower.remove({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async search(client: Client, body: { query: string, offset?: number, count?: number, mine: boolean }) {
        if (client.humanId) {
            return transactions.tower.search({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async join(client: Client, body: { towerId: string }) {
        if (client.humanId) {
            return transactions.tower.join({ ...body, requesterId: client.humanId })
        } else {
            return { success: false }
        }
    }
}

export default TowerService
