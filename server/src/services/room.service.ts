import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import { secureObject } from "../utils/filter";
import { IRoom } from "../models/room.model";

class RoomService {
    async create(client: Client, body: { towerId: string, title: string, avatarId: string, isPublic: boolean, floor: string }) {
        if (client.humanId) {
            return transactions.room.create({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async remove(client: Client, body: { towerId: string, roomId: string }) {
        if (client.humanId) {
            return transactions.room.remove({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async search(client: Client, body: { query: string, offset?: number, count?: number, towerId: string }) {
        if (client.humanId) {
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
    async readById(client: Client, body: { towerId: string, roomId: string }) {
        if (client.humanId) {
            return transactions.room.readById({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
    async update(client: Client, body: { towerId: string, roomId: string, title: string, avatarId: string, isPublic: string }) {
        if (client.humanId) {
            return transactions.room.update({ ...body, humanId: client.humanId })
        } else {
            return { success: false }
        }
    }
}

export default RoomService
