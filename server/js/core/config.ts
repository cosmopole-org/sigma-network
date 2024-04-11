
export let config = {
    TEMP_STORAGE: ""
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
