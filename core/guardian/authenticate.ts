import MemoryDriver from "../drivers/memory/memory"

const authenticate = async (token: string) => {
    let humanId = await MemoryDriver.instance.fetch(`auth:${token}`)
    if (humanId) {
        return { granted: true, humanId }
    } else {
        return { granted: false }
    }
}

export default authenticate
