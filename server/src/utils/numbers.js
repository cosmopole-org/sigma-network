
module.exports.isIdEmpty = (id) => {
    return id === undefined || id === null || id.length === 0;
};

module.exports.isReadOffsetEmpty = (offset) => {
    return offset <= 0;
};

module.exports.isReadCountEmpty = (count) => {
    return count <= 0 || count === undefined || count === null;
};

module.exports.isReadCountInvalid = (count) => {
    return count > 100;
};
