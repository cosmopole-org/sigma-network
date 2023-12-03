import Client from "../drivers/network/client";
import * as transactions from '../database/transactions/transactions'
import guardian from "guardian";
import MemoryDriver from "drivers/memory/memory";
import NetworkDriver from "drivers/network/network";

class MachineService {
    async create(client: Client, body: { name: string }, requestId: string) {
        if (client.humanId) {
            let result = await transactions.machine.create({ ...body, creatorId: client.humanId })
            if (result.success) {
                await MemoryDriver.instance.save(`auth:${result.machine.secret.token}`, result.machine.id)
            }
            return result
        } else {
            return { success: false }
        }
    }
    async update(client: Client, body: { machineId: string, name: string }, requestId: string) {
        if (client.humanId) {
            let result = await transactions.machine.update({ ...body, humanId: client.humanId })
            return result
        } else {
            return { success: false }
        }
    }
    async remove(client: Client, body: { machineId: string }, requestId: string) {
        if (client.humanId) {
            let result = await transactions.machine.remove({ ...body, humanId: client.humanId })
            if (result.success) {
                await MemoryDriver.instance.remove(`auth:${result.machine.secret.token}`)
            }
            return result
        } else {
            return { success: false }
        }
    }
    async search(client: Client, body: { query: string, offset?: number, count?: number }, requestId: string) {
        let result = await transactions.machine.search({ ...body })
        return result
    }
    async read(client: Client, body: { offset?: number, count?: number }, requestId: string) {
        let result = await transactions.machine.read({ ...body })
        return result
    }
    async signIn(client: Client, body: { token: string }, requestId: string) {
        let { granted, humanId } = await guardian.authenticate(body.token)
        if (granted) {
            let result = await transactions.machine.signIn(humanId)
            client.updateHumanId(humanId)
            NetworkDriver.instance.keepClient(body.token, client)
            client.joinTowers(result.towerIds)
            return result
        } else {
            return { success: false }
        }
    }
}

export default MachineService
