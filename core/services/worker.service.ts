import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import guardian from "../guardian";
import MemoryDriver from "../drivers/memory/memory";
import NetworkDriver from "../drivers/network/network";
import updater from "../updater";

class WorkerService {
    async create(client: Client, body: { towerId: string, roomId: string, machineId: string }, requestId: string) {
        let { granted, rights } = await guardian.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.worker.create({ ...body, humanId: client.humanId })
            if (result.success) {
                await Promise.all([
                    MemoryDriver.instance.save(`worker:${body.roomId}:${body.machineId}`, true),
                    MemoryDriver.instance.fetch(`workerExtra:${body.roomId}:${result.worker.id}`),
                    MemoryDriver.instance.fetch(`machineWorker:${result.worker.id}`)
                ])
            }
            return result
        } else {
            return { success: false }
        }
    }
    async remove(client: Client, body: { workerId: string, towerId: string, roomId: string }, requestId: string) {
        let { granted, rights } = await guardian.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.worker.remove({ ...body, humanId: client.humanId })
            if (result.success) {
                await Promise.all([
                    MemoryDriver.instance.remove(`worker:${body.roomId}:${result.worker.machineId}`),
                    MemoryDriver.instance.remove(`workerExtra:${body.roomId}:${body.workerId}`),
                    MemoryDriver.instance.remove(`machineWorker:${result.worker.id}`)
                ])
            }
            return result
        } else {
            return { success: false }
        }
    }
    async read(client: Client, body: { towerId: string, roomId: string }, requestId: string) {
        let result = await transactions.worker.read({ ...body, humanId: client.humanId })
        return result
    }
    async use(client: Client, body: { towerId: string, roomId: string, workerId: string, packet: any }, requestId: string) {
        let [res1, res2, res3] = await Promise.all([
            MemoryDriver.instance.fetch(`struct:${body.towerId}:${body.roomId}`),
            MemoryDriver.instance.fetch(`workerExtra:${body.roomId}:${body.workerId}`),
            MemoryDriver.instance.fetch(`machineWorker:${body.workerId}`)
        ])
        if (res1 && res2) {
            NetworkDriver.instance.clients[res3].emit(updater.buildUpdate(requestId, { category: 'worker', key: 'onRequest'}, body.packet))
        } else {
            return { success: false }
        }
    }
    async deliver(client: Client, body: { towerId: string, roomId: string, workerId: string, humanId: string, packet: any }, requestId: string) {
        let [res1, res2, res3] = await Promise.all([
            MemoryDriver.instance.fetch(`struct:${body.towerId}:${body.roomId}`),
            MemoryDriver.instance.fetch(`worker:${body.roomId}:${client.humanId}`),
            guardian.rules.isRule(body.towerId, body.humanId)
        ])
        if (res1 && res2 && res3) {
            NetworkDriver.instance.clients[body.humanId].emit(updater.buildUpdate(requestId, { category: 'worker', key: 'onResponse'}, body.packet))
        } else {
            return { success: false }
        }
    }
}

export default WorkerService
