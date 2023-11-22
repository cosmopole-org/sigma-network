
export let config = {
    bridge: {
        mkdir: undefined,
        writeFile: undefined,
        rm: undefined,
        existsSync: undefined
    }
}

const setupConfig = (conf: { [id: string]: any }) => {
    for (let key in conf) {
        config[key] = conf[key]
    }
}

export default config
export {
    setupConfig
}
