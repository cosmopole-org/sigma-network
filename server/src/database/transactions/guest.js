
const mongoose = require('mongoose');
let { Pending, User, Session, Tower, Room, Member, Workspace } = require('../schemas/schemas');
let { isEmpty, isNameFieldInvalid } = require('../../../../shared/utils/strings');
let defaultAvatars = require('../../../../constants/avatars.json');
let permissions = require('../../../../constants/permissions.json');
let { centralTower, centralTowerHall } = require('../initiators/main-initiator');
const {
    v4: uuidv4,
} = require('uuid');
const jwt = require('jsonwebtoken');
const SessionFactory = require('../factories/session-factory');
const PendingFactory = require('../factories/pending-factory');
const InviteFactory = require('../factories/invite-factory');
const RoomFactory = require('../factories/room-factory');
const TowerFactory = require('../factories/tower-factory');
const MemberFactory = require('../factories/member-factory');
const UserFactory = require('../factories/user-factory');
const InteractionFactory = require('../factories/interaction-factory');
const { makeUniqueId } = require('../../../../shared/utils/id-generator');
const MemoryDriver = require('../../memory');

const checkImports = () => {
    if (Pending === undefined) {
        Pending = require('../schemas/schemas').Pending;
    }
    if (User === undefined) {
        User = require('../schemas/schemas').User;
    }
    if (Session === undefined) {
        Session = require('../schemas/schemas').Session;
    }
    if (Tower === undefined) {
        Tower = require('../schemas/schemas').Tower;
    }
    if (Room === undefined) {
        Room = require('../schemas/schemas').Room;
    }
    if (Workspace === undefined) {
        Workspace = require('../schemas/schemas').Workspace;
    }
    if (Member === undefined) {
        Member = require('../schemas/schemas').Member;
    }
    if (centralTower === undefined) {
        centralTower = require('../initiators/main-initiator').centralTower;
    }
    if (centralTowerHall === undefined) {
        centralTowerHall = require('../initiators/main-initiator').centralTowerHall;
    }
}

module.exports.dbGuest = async ({ }) => {
    checkImports();
    const session = await mongoose.startSession();
    session.startTransaction();
    let user, userSession;
    try {
        let userGenedId = makeUniqueId();
        userSession = await SessionFactory.instance().create({
            id: makeUniqueId(),
            token: uuidv4(),
            userId: userGenedId,
        }, session);
        user = await UserFactory.instance().create({
            id: userGenedId,
            firstName: `guest`,
            isGuest: true,
            secret: {
                sessionIds: [userSession.id]
            }
        }, session);
        await session.commitTransaction();
        session.endSession();
        return {
            success: true,
            session: userSession,
            user,
        };
    } catch (error) {
        console.error(error);
        console.error('abort transaction');
        await session.abortTransaction();
        session.endSession();
        return { success: false };
    }
}
