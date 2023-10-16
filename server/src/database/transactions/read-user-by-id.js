
const mongoose = require('mongoose');
let { User } = require('../schemas/schemas');
const { secureObject, secureAdmins } = require('../../../../shared/utils/filter');
const UserFactory = require('../factories/user-factory');

const checkImports = () => {
  if (User === undefined) {
    User = require('../schemas/schemas').User;
  }
}

module.exports.dbReadUserById = async ({ targetUserId }, userId) => {
  checkImports();
  try {
    let user = (await UserFactory.instance().find({ id: targetUserId })).toObject();
    return { success: true, user: secureObject(user, 'secret') };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}
