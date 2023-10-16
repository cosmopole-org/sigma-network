
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

module.exports.dbSetupUser = async ({ auth0AccessToken, firstName, lastName, publicKey }) => {
    if (isEmpty(firstName)) {
        console.error('first name can not be empty');
        return { success: false };
    }
    if (isNameFieldInvalid(firstName)) {
        console.error('name can not be longer than limit.');
        return { success: false };
    }
    checkImports();
    const session = await mongoose.startSession();
    session.startTransaction();
    const inputData = JSON.parse(Buffer.from(auth0AccessToken.split('.')[1], 'base64').toString());
    let email = inputData['https://internal.cosmopole.cloud/email'];
    let pending, user, userSession, tower, room, member, defaultMembership;
    try {
        pending = await PendingFactory.instance().find({ email: email }, session);
        if (pending === null) {
            let userGenedId = makeUniqueId();
            userSession = await SessionFactory.instance().create({
                id: makeUniqueId(),
                token: uuidv4(),
                userId: userGenedId,
            }, session);
            let towerGenedId = makeUniqueId();
            let roomGenedId = makeUniqueId();
            user = await UserFactory.instance().create({
                id: userGenedId,
                firstName: firstName,
                lastName: lastName,
                publicKey: publicKey,
                isGuest: false,
                secret: {
                    email: email,
                    homeId: towerGenedId,
                    sessionIds: [userSession.id]
                }
            }, session);
            tower = await TowerFactory.instance().create({
                id: towerGenedId,
                title: `${firstName}'s home`,
                avatarId: defaultAvatars.EMPTY_TOWER_AVATAR_ID,
                isPublic: false,
                secret: {
                    adminIds: [
                        userGenedId
                    ]
                }
            }, session);
            room = await RoomFactory.instance().create({
                id: roomGenedId,
                title: 'hall',
                avatarId: defaultAvatars.HALL_DEFAULT_AVATAR_ID,
                isPublic: false,
                floor: 'hall',
                towerId: towerGenedId,
                secret: {
                    adminIds: [
                        userGenedId
                    ]
                }
            }, session);
            member = await MemberFactory.instance().create({
                id: makeUniqueId(),
                userId: user.id,
                roomId: room.id,
                towerId: tower.id,
                secret: {
                    permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
                }
            }, session);
            await MemoryDriver.instance().save(
                `rights:${member.roomId}/${member.userId}`, JSON.stringify(member.secret.permissions)
            );
            defaultMembership = await MemberFactory.instance().create({
                id: makeUniqueId(),
                userId: user.id,
                roomId: centralTowerHall.id,
                towerId: centralTower.id,
                secret: {
                    permissions: permissions.DEFAULT_ROOM_ADMIN_PERMISSIONS
                }
            }, session);
            await MemoryDriver.instance().save(
                `rights:${defaultMembership.roomId}/${defaultMembership.userId}`, JSON.stringify(defaultMembership.secret.permissions)
            );
            pending = await PendingFactory.instance().create({
                id: makeUniqueId(), email: email, userId: userGenedId
            }, session);
            await session.commitTransaction();
            session.endSession();
            return {
                success: true,
                session: userSession,
                user,
                tower,
                room,
                member,
                defaultMembership,
                centralTower,
                centralTowerHall
            };
        } else {
            await session.abortTransaction();
            session.endSession();
            return { success: false };
        }
    } catch (error) {
        console.error(error);
        console.error('abort transaction');
        await session.abortTransaction();
        session.endSession();
        return { success: false };
    }
}
