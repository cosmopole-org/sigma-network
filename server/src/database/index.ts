
import HumanFactory from './factories/human-factory';
import TowerFactory from './factories/tower-factory';
import RoomFactory from './factories/room-factory';
import SessionFactory from './factories/session-factory';
import MemberFactory from './factories/member-factory';
import PendingFactory from './factories/pending-factory';
import InviteFactory from './factories/invite-factory';
import { connectMongoClient } from './drivers/main-driver';
import { buildSchemas } from './schema/build';

class StorageDriver {
    static _instancce: StorageDriver;
    public static get instance() { return StorageDriver._instancce }
    static initialize(callback: () => void) {
        return new StorageDriver(callback);
    }
    constructor(callback: () => void) {
        StorageDriver._instancce = this;
        connectMongoClient().then(() => {
            buildSchemas()
            HumanFactory.initialize();
            TowerFactory.initialize();
            RoomFactory.initialize();
            InviteFactory.initialize();
            MemberFactory.initialize();
            PendingFactory.initialize();
            SessionFactory.initialize();
            callback()
        });
    }
}

export default StorageDriver;
