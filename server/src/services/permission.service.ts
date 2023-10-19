import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'

class PermissionService {
    async update(client: Client, body: { towerId: string, targetHumanId: string, permissions: { [id: string]: boolean } }) {
        if (client.humanId) {
            return transactions.permission.update({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async read(client: Client, body: { towerId: string, targetHumanId: string }) {
        if (client.humanId) {
            return transactions.permission.read({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
}

export default PermissionService
