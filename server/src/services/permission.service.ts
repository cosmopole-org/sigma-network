import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import updater from "../updater";
import NetworkDriver from "../drivers/network/network";

class PermissionService {
    async update(client: Client, body: { towerId: string, targetHumanId: string, permissions: { [id: string]: boolean } }, requestId: string) {
        if (client.humanId) {
           let result = await transactions.permission.update({ ...body, humanId: client.humanId })
           NetworkDriver.instance.clients[body.targetHumanId].emit(updater.buildUpdate(requestId, updater.types.permission.onUpdate, body.permissions))
           return result
        } else {
            return { success: false }
        }
    }
    async read(client: Client, body: { towerId: string, targetHumanId: string }, requestId: string) {
        if (client.humanId) {
            return transactions.permission.read({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
}

export default PermissionService
