
import MemoryDriver from "../../drivers/memory/memory"

const addRule = (towerId: string, humanId: string, permissions: { [id: string]: boolean }) => {
    MemoryDriver.instance.save(
        `rights:${towerId}:${humanId}`, permissions
    )
}

export default addRule
