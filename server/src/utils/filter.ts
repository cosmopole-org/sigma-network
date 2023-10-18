
function secureObject(obj: any, forbiddenKey: string) {
    let newObj = {...obj};
    delete newObj[forbiddenKey]
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