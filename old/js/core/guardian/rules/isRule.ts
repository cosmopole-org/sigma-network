
import MemoryDriver from "../../drivers/memory/memory"

const isRule = async (towerId: string, humanId: string) => {
    return (await MemoryDriver.instance.fetch(
        `rights:${towerId}:${humanId}`
    )) !== undefined
}

export default isRule
