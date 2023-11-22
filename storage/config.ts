import { setupFoldersPath } from "folders"

let config = {
    LIARA_ENDPOINT: "",
    LIARA_BUCKET_NAME: "",
    LIARA_ACCESS_KEY: "",
    LIARA_SECRET_KEY: "",
    MONGODB_URI: "",
    TEMP_STORAGE: ""
}

export let setupConfig = (c: any) => {
    for (let key in config) {
        config[key] = c[key]
    }
    setupFoldersPath(config.TEMP_STORAGE)
}

export default config
