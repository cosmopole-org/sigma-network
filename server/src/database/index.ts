
import { setupDatabase } from './initiators/main-initiator';
import HumanFactory from './factories/human-factory';
import TowerFactory from './factories/tower-factory';
import RoomFactory from './factories/room-factory';
import SessionFactory from './factories/session-factory';
import MemberFactory from './factories/member-factory';
import PendingFactory from './factories/pending-factory';
import InviteFactory from './factories/invite-factory';

class StorageDriver {
    static _instancce: StorageDriver;
    public static get instance() { return StorageDriver._instancce }
    static initialize() {
        return new StorageDriver();
    }
    userFactory;
    towerFactory;
    roomFactory;
    workspaceFactory;
    inviteFactory;
    memberFactory;
    pendingFactory;
    sessionFactory;
    constructor() {
        StorageDriver._instancce = this;
        setupDatabase()
        this.userFactory = HumanFactory.initialize();
        this.towerFactory = TowerFactory.initialize();
        this.roomFactory = RoomFactory.initialize();
        this.inviteFactory = InviteFactory.initialize();
        this.memberFactory = MemberFactory.initialize();
        this.pendingFactory = PendingFactory.initialize();
        this.sessionFactory = SessionFactory.initialize();
    }
}

export default StorageDriver;
