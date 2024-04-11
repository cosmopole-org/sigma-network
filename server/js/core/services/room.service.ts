import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import { secureObject } from "../utils/filter";
import { IRoom } from "../models/room.model";
import NetworkDriver from "../drivers/network/network";
import MemoryDriver from "drivers/memory/memory";
import Extendables, { EntityTypes } from "../extendables";
import Guardian from "../guardian";
import Updater from "../updater";

class RoomService {
    extendables: Extendables
    constructor(meta: { extendables: Extendables }) {
        this.extendables = meta.extendables
    }
    async create(client: Client, body: { towerId: string, title: string, avatarId: string, isPublic: boolean, floor: string }, requestId: string) {
        let { granted } = await Guardian.instance.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.room.create({ ...body, humanId: client.humanId, creationCallback: this.extendables.store[EntityTypes.ROOM_CREATION] })
            if (result.success) {
                NetworkDriver.instance.group(body.towerId).boradcast.emit(client, Updater.instance.buildUpdate(requestId, Updater.instance.types.room.onCreate,
                    secureObject(result.room, 'secret')
                ))
                await MemoryDriver.instance.save(`struct:${body.towerId}:${result.room.id}`, true)
            }
            return result
        } else {
            return { success: false }
        }
    }
    async remove(client: Client, body: { towerId: string, roomId: string }, requestId: string) {
        let { granted } = await Guardian.instance.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.room.remove({ ...body, humanId: client.humanId })
            if (result.success) {
                NetworkDriver.instance.group(body.towerId).boradcast.emit(client, Updater.instance.buildUpdate(requestId, Updater.instance.types.room.onRemove,
                    secureObject(result.room, 'secret')
                ))
                await MemoryDriver.instance.remove(`struct:${body.towerId}:${result.room.id}`)
            }
            return result
        } else {
            return { success: false }
        }
    }
    async search(client: Client, body: { query: string, offset?: number, count?: number, towerId: string }, requestId: string) {
        let { granted } = await Guardian.instance.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.room.search({ ...body, humanId: client.humanId })
            if (result.success && result.rooms) {
                if (!result.tower.secret.adminIds.includes(client.humanId)) {
                    result.rooms = result.rooms.map((r: IRoom) => secureObject(r, 'secret'))
                }
            }
            return result
        } else {
            return { success: false }
        }
    }
    async readById(client: Client, body: { towerId: string, roomId: string }, requestId: string) {
        if (client.humanId) {
            return transactions.room.readById({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async update(client: Client, body: { towerId: string, roomId: string, title: string, avatarId: string, isPublic: string }, requestId: string) {
        let { granted } = await Guardian.instance.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.room.update({ ...body, humanId: client.humanId })
            if (result.success) {
                NetworkDriver.instance.group(body.towerId).boradcast.emit(client, Updater.instance.buildUpdate(requestId, Updater.instance.types.room.onUpdate,
                    secureObject(result.room, 'secret')
                ))
            }
            return result
        } else {
            return { success: false }
        }
    }
}

export default RoomService
