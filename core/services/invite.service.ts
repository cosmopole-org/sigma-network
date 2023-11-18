import Client from "../drivers/network/client"
import * as transactions from '../database/transactions/transactions'
import updater from "../updater"
import NetworkDriver from "../drivers/network/network"
import { secureObject } from "../utils/filter"
import { IRoom } from "../models/room.model"
import guardian from "../guardian"

class InviteService {
    async create(client: Client, body: { towerId: string, targetHumanId: string }, requestId: string) {
        let { granted, rights } = await guardian.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.invite.create({ ...body, senderId: client.humanId })
            if (result.success) {
                NetworkDriver.instance.clients[body.targetHumanId]?.emit(updater.buildUpdate(requestId, updater.types.invite.onCreate, result.invite))
            }
            return result
        } else {
            return { success: false }
        }
    }
    async cancel(client: Client, body: { towerId: string, inviteId: string }, requestId: string) {
        let { granted, rights } = await guardian.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.invite.cancel({ ...body, humanId: client.humanId })
            if (result.success) {
                NetworkDriver.instance.clients[result.targetHumanId]?.emit(updater.buildUpdate(requestId, updater.types.invite.onCancel, body.inviteId))
                delete result.targetHumanId
            }
            return result
        } else {
            return { success: false }
        }
    }
    async decline(client: Client, body: { towerId: string, inviteId: string }, requestId: string) {
        if (client.humanId) {
            let result = await transactions.invite.decline({ ...body, humanId: client.humanId })
            if (result.success) {
                result.adminIds.forEach((adminId: string) => {
                    NetworkDriver.instance.clients[adminId]?.emit(updater.buildUpdate(requestId, updater.types.invite.onDecline, body.inviteId))
                });
                delete result.adminIds
            }
            return result
        } else {
            return { success: false }
        }
    }
    async accept(client: Client, body: { towerId: string, inviteId: string }, requestId: string) {
        if (client.humanId) {
            let result = await transactions.invite.accept({ ...body, humanId: client.humanId })
            if (result.success) {
                result.tower.secret.adminIds.forEach((adminId: string) => {
                    NetworkDriver.instance.clients[adminId]?.emit(updater.buildUpdate(requestId, updater.types.invite.onAccept, body.inviteId))
                });
                guardian.rules.addRule(result.member.towerId, result.member.humanId, result.member.secret.permissions)
                client.updateTowerId(result.member.towerId, result.member.secret.permissions)
                client.joinTower(result.member.towerId)
                result.tower = secureObject(result.tower, 'secret')
                result.room = secureObject(result.room, 'secret')
                result.rooms = result.rooms.map((room: IRoom) => secureObject(room, 'secret'))
            }
            return result
        } else {
            return { success: false }
        }
    }
    async read(client: Client, body: {}, requestId: string) {
        if (client.humanId) {
            return transactions.invite.read({ humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
}

export default InviteService
