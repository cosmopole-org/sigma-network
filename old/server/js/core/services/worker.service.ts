import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import guardian from "../guardian";
import MemoryDriver from "../drivers/memory/memory";
import NetworkDriver from "../drivers/network/network";
import updater from "../updater";
import { IWorker } from "models/worker.model";

class WorkerService {

    humanRequests: { [id: string]: string } = {};

    async create(client: Client, body: { towerId: string, roomId: string, machineId: string, secret: any }, requestId: string) {
        let { granted, rights } = await guardian.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.worker.create({ ...body, humanId: client.humanId })
            if (result.success) {
                await Promise.all([
                    MemoryDriver.instance.save(`worker:${body.roomId}:${body.machineId}`, true),
                    MemoryDriver.instance.save(`workerExtra:${body.roomId}:${result.worker.id}`, true),
                    MemoryDriver.instance.save(`machineWorker:${result.worker.id}`, body.machineId)
                ])
            }
            return result
        } else {
            return { success: false }
        }
    }
    async update(client: Client, body: { towerId: string, roomId: string, worker: IWorker }, requestId: string) {
        let { granted, rights } = await guardian.authorize(client, body.towerId)
        if (granted) {
            let result = await transactions.worker.update({ ...body, humanId: client.humanId })
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
                if (result.wasTheLast) {
                    await Promise.all([
                        MemoryDriver.instance.remove(`worker:${body.roomId}:${result.worker.machineId}`),
                        MemoryDriver.instance.remove(`workerExtra:${body.roomId}:${body.workerId}`),
                        MemoryDriver.instance.remove(`machineWorker:${result.worker.id}`)
                    ])
                } else {
                    await Promise.all([
                        MemoryDriver.instance.remove(`workerExtra:${body.roomId}:${body.workerId}`),
                        MemoryDriver.instance.remove(`machineWorker:${result.worker.id}`)
                    ])
                }
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
    async use(client: Client, body: { towerId?: string, roomId?: string, workerId?: string, machineId?: string, packet: any }, requestId: string) {
        if (body.machineId) {
            this.humanRequests[client.humanId] = body.machineId
            body.packet.humanId = client.humanId
            NetworkDriver.instance.clients[body.machineId]?.emit(updater.buildUpdate(requestId, { category: 'worker', key: 'onRequest' }, body.packet))
            return { success: true };
        } else {
            let [res1, res2, res3] = await Promise.all([
                MemoryDriver.instance.fetch(`struct:${body.towerId}:${body.roomId}`),
                MemoryDriver.instance.fetch(`workerExtra:${body.roomId}:${body.workerId}`),
                MemoryDriver.instance.fetch(`machineWorker:${body.workerId}`)
            ])
            if (res1 && res2) {
                body.packet.towerId = body.towerId
                body.packet.roomId = body.roomId
                body.packet.workerId = body.workerId
                body.packet.humanId = client.humanId
                NetworkDriver.instance.clients[res3]?.emit(updater.buildUpdate(requestId, { category: 'worker', key: 'onRequest' }, body.packet))
                return { success: true }
            } else {
                return { success: false }
            }
        }
    }
    async deliver(client: Client, body: { towerId?: string, roomId?: string, workerId?: string, humanId?: string, exceptionId?: string, packet: any }, requestId: string) {
        if (body.towerId) {
            if (body.humanId) {
                let [res1, res2, res3] = await Promise.all([
                    MemoryDriver.instance.fetch(`struct:${body.towerId}:${body.roomId}`),
                    MemoryDriver.instance.fetch(`worker:${body.roomId}:${client.humanId}`),
                    guardian.rules.isRule(body.towerId, body.humanId)
                ])
                if (res1 && res2 && res3) {
                    body.packet.towerId = body.towerId
                    body.packet.roomId = body.roomId
                    body.packet.workerId = body.workerId
                    body.packet.humanId = body.humanId
                    NetworkDriver.instance.clients[body.humanId]?.emit(updater.buildUpdate(requestId, { category: 'worker', key: 'onResponse' }, body.packet))
                    return { success: true }
                } else {
                    return { success: false }
                }
            } else {
                let [res1, res2] = await Promise.all([
                    MemoryDriver.instance.fetch(`struct:${body.towerId}:${body.roomId}`),
                    MemoryDriver.instance.fetch(`worker:${body.roomId}:${client.humanId}`),
                ])
                if (res1 && res2) {
                    body.packet.towerId = body.towerId
                    body.packet.roomId = body.roomId
                    body.packet.workerId = body.workerId
                    if (body.exceptionId) {
                        let exception = NetworkDriver.instance.clients[body.exceptionId]
                        if (exception) {
                            NetworkDriver.instance.group(body.towerId).boradcast.emit(exception, updater.buildUpdate(requestId, { category: 'worker', key: 'onResponse' }, body.packet))
                        } else {
                            NetworkDriver.instance.group(body.towerId).emit(updater.buildUpdate(requestId, { category: 'worker', key: 'onResponse' }, body.packet))
                        }
                    } else {
                        NetworkDriver.instance.group(body.towerId).emit(updater.buildUpdate(requestId, { category: 'worker', key: 'onResponse' }, body.packet))
                    }
                    return { success: true }
                } else {
                    return { success: false }
                }
            }
        } else {
            if (body.humanId) {
                if (this.humanRequests[body.humanId] === client.humanId) {
                    body.packet.machineId = client.humanId
                    NetworkDriver.instance.clients[body.humanId]?.emit(updater.buildUpdate(requestId, { category: 'worker', key: 'onResponse' }, body.packet))
                    return { success: true }
                } else {
                    return { success: false }
                }
            } else {
                return { success: false }
            }
        }
    }
}

export default WorkerService
