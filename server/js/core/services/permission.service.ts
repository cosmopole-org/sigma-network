import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import updater from "../updater";
import NetworkDriver from "../drivers/network/network";
import guardian from "../guardian";

class PermissionService {
    async update(client: Client, body: { towerId: string, targetHumanId: string, permissions: { [id: string]: boolean } }, requestId: string) {
        let { granted, rights } = await guardian.authorize(client, body.towerId)
        if (granted) {
           let result = await transactions.permission.update({ ...body, humanId: client.humanId })
           NetworkDriver.instance.clients[body.targetHumanId]?.emit(updater.buildUpdate(requestId, updater.types.permission.onUpdate, body.permissions))
           return result
        } else {
            return { success: false }
        }
    }
    async read(client: Client, body: { towerId: string, targetHumanId: string }, requestId: string) {
        let { granted, rights } = await guardian.authorize(client, body.towerId)
        if (granted) {
            return transactions.permission.read({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
}

export default PermissionService
