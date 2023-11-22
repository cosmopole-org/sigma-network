
let config = {
    LIARA_ENDPOINT: "",
    LIARA_BUCKET_NAME: "",
    LIARA_ACCESS_KEY: "",
    LIARA_SECRET_KEY: "",
    MONGODB_URI: "",
    bridge: {
        mkdir: undefined,
        writeFile: undefined,
        rm: undefined,
        existsSync: undefined
    }
}

export let setupConfig = (c: any) => {
    for (let key in config) {
        config[key] = c[key]
    }
}

export default config
