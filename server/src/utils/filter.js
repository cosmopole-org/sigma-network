
module.exports.secureObject = function (obj, forbiddenKey) {
    let newObj = {};
    Object.keys(obj).forEach(key => {
        if (key !== forbiddenKey) {
            newObj[key] = obj[key];
        }
    });
    console.log(newObj);
    return newObj;
}

module.exports.secureAdmins = function (obj, safeUserId) {
    obj.secret.adminIds = obj.secret.adminIds.filter(adminId => (adminId === safeUserId));
    return obj;
}
