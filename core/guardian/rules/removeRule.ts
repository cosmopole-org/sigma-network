
import MemoryDriver from "../../drivers/memory/memory"

const removeRule = (towerId: string, humanId: string) => {
    MemoryDriver.instance.remove(
        `rights:${towerId}:${humanId}`
    )
}

export default removeRule
