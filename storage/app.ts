
import * as upload from './database/transactions/upload'
import * as download from './database/transactions/download'
import { setupConfig } from 'config'
import StorageDriver from 'database'

class SigmaStorage {
    constructor(config: any) {
        setupConfig(config)
    }
    public async start() {
        await StorageDriver.initialize()
    }
    public uploader = upload
    public downloader = download

}

export default SigmaStorage
