import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import { secureObject } from "../utils/filter";
import { ITower } from "../models/tower.model";
import NetworkDriver from "../drivers/network/network";
import updater from "../updater";

class TowerService {
    async create(client: Client, body: { title: string, avatarId: string, isPublic: boolean }, requestId: string) {
        if (client.humanId) {
            return transactions.tower.create({ ...body, ownerId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async update(client: Client, body: { towerId: string, title: string, avatarId: string, isPublic: boolean }, requestId: string) {
        if (client.humanId) {
            let result = await transactions.tower.update({ ...body, humanId: client.humanId })
            if (result.success) {
                NetworkDriver.instance.group(body.towerId).emit(updater.buildUpdate(requestId, updater.types.tower.onUpdate, secureObject(result.tower, 'secret')))
            }
            return result
        } else {
            return { success: false }
        }
    }
    async remove(client: Client, body: { towerId: string }, requestId: string) {
        if (client.humanId) {
            let result = await transactions.tower.remove({ ...body, humanId: client.humanId })
            if (result.success) {
                NetworkDriver.instance.group(body.towerId).emit(updater.buildUpdate(requestId, updater.types.tower.onRemove, secureObject(result.tower, 'secret')))
            }
        } else {
            return { success: false }
        }
    }
    async search(client: Client, body: { query: string, offset?: number, count?: number, mine: boolean }, requestId: string) {
        if (client.humanId) {
            let result = await transactions.tower.search({ ...body, humanId: client.humanId })
            if (result.success && result.towers) {
                result.towers = result.towers.map((t: ITower) => t.secret.ownerId === client.humanId ? t : secureObject(t, 'secret'))
            }
            return result
        } else {
            return { success: false }
        }
    }
    async join(client: Client, body: { towerId: string }, requestId: string) {
        if (client.humanId) {
            let result = await transactions.tower.join({ ...body, requesterId: client.humanId })
            if (result.success) {
                NetworkDriver.instance.group(body.towerId).emit(updater.buildUpdate(requestId, updater.types.tower.onHumanJoin, secureObject(result.member, 'secret')))
            }
            return result
        } else {
            return { success: false }
        }
    }
}

export default TowerService
