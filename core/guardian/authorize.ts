
import MemoryDriver from "../drivers/memory/memory"
import Client from "../drivers/network/client"

const authorize = async (client: Client, towerId: string, roomId?: string) => {
    if (client.towerId === towerId) {
        if (roomId) {
            if (await MemoryDriver.instance.fetch(`struct:${towerId}:${roomId}`)) {
                return { granted: true, rights: client.rights, roomId }
            } else {
                return { granted: false }
            }
        } else {
            return { granted: true, rights: client.rights }
        }
    }
    if (client.humanId) {
        let rights = await MemoryDriver.instance.fetch(`rights:${towerId}:${client.humanId}`)
        if (rights) {
            client.towerId = towerId
            if (roomId) {
                if (await MemoryDriver.instance.fetch(`struct:${towerId}:${roomId}`)) {
                    return { granted: true, rights, roomId }
                } else {
                    return { granted: false }
                }
            } else {
                return { granted: true, rights }
            }
        } else {
            return { granted: false }
        }
    } else {
        return { granted: false }
    }
}

export default authorize
