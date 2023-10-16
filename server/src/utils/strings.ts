
const isEmpty = (str) => {
    return (str === undefined || str === null || str.length === 0);
};

const isNameFieldInvalid = (str) => {
    if (str === undefined || str === null) return true;
    return str.length > 64;
};

const isInviteTitleInvalid = (str) => {
    if (str === undefined || str === null) return false;
    return str.length > 64;
};

const isInviteTextInvalid = (str) => {
    if (str === undefined || str === null) return false;
    return str.length > 512;
};

const isWorkspaceTitleInvalid = (str) => {
    if (str === undefined || str === null) return false;
    return str.length > 64;
};

const isFileBoxTitleInvalid = (str) => {
    if (str === undefined || str === null) return false;
    return str.length > 64;
};

const isListDescriptionInvalid = (str) => {
    if (str === undefined || str === null) return false;
    return str.length > 200;
};

export {
    isEmpty,
    isFileBoxTitleInvalid,
    isInviteTextInvalid,
    isInviteTitleInvalid,
    isListDescriptionInvalid,
    isNameFieldInvalid,
    isWorkspaceTitleInvalid,
}