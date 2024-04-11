import { setupDatabase } from "./initiators/main-initiator";

class StorageDriver {
    static inst;
    static async initialize() {
        return new Promise((resolve: any) => {
            return new StorageDriver(resolve);
        })
    }
    static instance() {
        return StorageDriver.inst;
    }
    constructor(callback: () => void) {
        StorageDriver.inst = this;
        setupDatabase().then(() => {
            callback();
        })
    }
}

export default StorageDriver;
