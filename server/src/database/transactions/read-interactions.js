
const mongoose = require('mongoose');
const PendingFactory = require('../factories/pending-factory');
const InviteFactory = require('../factories/invite-factory');
const RoomFactory = require('../factories/room-factory');
const TowerFactory = require('../factories/tower-factory');
const MemberFactory = require('../factories/member-factory');
const UserFactory = require('../factories/user-factory');
const InteractionFactory = require('../factories/interaction-factory');
const { makeUniqueId } = require('../../../../shared/utils/id-generator');

module.exports.dbReadInteractions = async ({ }, userId) => {
    try {
        let data = await InteractionFactory.instance().read(0, 100, {
            $or: [
                { user1Id: userId },
                { user2Id: userId }
            ]
        });
        return { success: true, interactions: data };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}
