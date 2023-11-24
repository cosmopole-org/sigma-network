import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import { secureObject } from "../utils/filter";
import { ITower } from "../models/tower.model";
import NetworkDriver from "../drivers/network/network";
import updater from "../updater";
import guardian from "../guardian";
import MemoryDriver from "drivers/memory/memory";

class TowerService {
    rcc: any
    constructor(rcc: any) {
        this.rcc = rcc
    }
    async create(client: Client, body: { title: string, avatarId: string, isPublic: boolean }, requestId: string) {
        if (client.humanId) {
            let result = await transactions.tower.create({ ...body, ownerId: client.humanId, creationCallback: this.rcc })
            if (result.success) {
                guardian.rules.addRule(result.member.towerId, result.member.humanId, result.member.secret.permissions)
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
        let { granted, rights } = await guardian.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.tower.update({ ...body, humanId: client.humanId })
            if (result.success) {
                NetworkDriver.instance.group(body.towerId).boradcast.emit(client, updater.buildUpdate(requestId, updater.types.tower.onUpdate, secureObject(result.tower, 'secret')))
            }
            return result
        } else {
            return { success: false }
        }
    }
    async remove(client: Client, body: { towerId: string }, requestId: string) {
        let { granted, rights } = await guardian.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.tower.remove({ ...body, humanId: client.humanId })
            if (result.success) {
                NetworkDriver.instance.group(body.towerId).boradcast.emit(client, updater.buildUpdate(requestId, updater.types.tower.onRemove, secureObject(result.tower, 'secret')))
                guardian.rules.removeRules(body.towerId, result.memberIds)
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
                NetworkDriver.instance.group(body.towerId).boradcast.emit(client, updater.buildUpdate(requestId, updater.types.tower.onHumanJoin, secureObject(result.member, 'secret')))
                guardian.rules.addRule(result.member.towerId, result.member.humanId, result.member.secret.permissions)
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
        let { granted, rights } = await guardian.authorize(client, body.towerId)
        if (granted) {
            return transactions.tower.readMembers({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
}

export default TowerService
