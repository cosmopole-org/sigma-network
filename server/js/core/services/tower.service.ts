import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import { secureObject } from "../utils/filter";
import { ITower } from "../models/tower.model";
import NetworkDriver from "../drivers/network/network";
import MemoryDriver from "drivers/memory/memory";
import Extendables, { EntityTypes } from "../extendables";
import Guardian from "../guardian";
import Updater from "updater";

class TowerService {
    extendables: Extendables
    constructor(meta: { extendables: Extendables }) {
        this.extendables = meta.extendables
    }
    async create(client: Client, body: { title: string, avatarId: string, isPublic: boolean }, requestId: string) {
        if (client.humanId) {
            let result = await transactions.tower.create({ ...body, ownerId: client.humanId, creationCallback: this.extendables.store[EntityTypes.ROOM_CREATION] })
            if (result.success) {
                Guardian.instance.rules.addRule(result.member.towerId, result.member.humanId, result.member.secret.permissions)
                client.updateTowerId(result.tower.id, result.member.secret.permissions)
                client.joinTower(result.tower.id)
                await MemoryDriver.instance.save(`struct:${result.tower.id}:${result.room.id}`, true)
            }
            return result
        } else {
            return { success: false }
        }
    }
    async update(client: Client, body: { towerId: string, title: string, avatarId: string, isPublic: boolean }, requestId: string) {
        let { granted } = await Guardian.instance.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.tower.update({ ...body, humanId: client.humanId })
            if (result.success) {
                NetworkDriver.instance.group(body.towerId).boradcast.emit(client, Updater.instance.buildUpdate(requestId, Updater.instance.types.tower.onUpdate, secureObject(result.tower, 'secret')))
            }
            return result
        } else {
            return { success: false }
        }
    }
    async remove(client: Client, body: { towerId: string }, requestId: string) {
        let { granted } = await Guardian.instance.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.tower.remove({ ...body, humanId: client.humanId })
            if (result.success) {
                NetworkDriver.instance.group(body.towerId).boradcast.emit(client, Updater.instance.buildUpdate(requestId, Updater.instance.types.tower.onRemove, secureObject(result.tower, 'secret')))
                Guardian.instance.rules.removeRules(body.towerId, result.memberIds)
            }
            return result
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
                NetworkDriver.instance.group(body.towerId).boradcast.emit(client, Updater.instance.buildUpdate(requestId, Updater.instance.types.tower.onHumanJoin, secureObject(result.member, 'secret')))
                Guardian.instance.rules.addRule(result.member.towerId, result.member.humanId, result.member.secret.permissions)
                client.updateTowerId(result.member.towerId, result.member.secret.permissions)
                client.joinTower(result.member.towerId)
            }
            return result
        } else {
            return { success: false }
        }
    }
    async readById(client: Client, body: { towerId: string }, requestId: string) {
        return transactions.tower.readById({ ...body, humanId: client.humanId })
    }
    async readMembers(client: Client, body: { towerId: string }, requestId: string) {
        let { granted } = await Guardian.instance.authorize(client, body.towerId)
        if (granted) {
            return transactions.tower.readMembers({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async read(client: Client, body: {}, requestId: string) {
        if (client.humanId) {
            let result = await transactions.tower.read({ humanId: client.humanId })
            if (result.success && result.towers) {
                result.towers = result.towers.map((t: ITower) => t.secret.ownerId === client.humanId ? t : secureObject(t, 'secret'))
            }
            return result
        } else {
            return { success: false }
        }
    }
    async addMember(towerId: string, humanId: string) {
        let result = await transactions.tower.addMember({ humanId, towerId })
        return result
    }
}

export default TowerService
