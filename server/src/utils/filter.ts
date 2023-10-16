
const secureObject = function (obj: any, forbiddenKey: string) {
    let newObj = {};
    Object.keys(obj).forEach(key => {
        if (key !== forbiddenKey) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
}

const secureAdmins = function (obj: any, safeUserId: string) {
    obj.secret.adminIds = obj.secret.adminIds.filter((adminId: string) => (adminId === safeUserId));
    return obj;
}

export {
    secureAdmins,
    secureObject
}