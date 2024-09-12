
import MemoryDriver from "../../drivers/memory/memory"

const removeRules = (towerId: string, humanIds: Array<string>) => {
    let keys = humanIds.map(i => `rights:${towerId}:${i}`)
    MemoryDriver.instance.remove(keys)
}

export default removeRules
