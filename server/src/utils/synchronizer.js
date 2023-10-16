
const isObject = (variable) => {
    return (
        (typeof variable === 'object') &&
        (typeof variable !== 'string') &&
        (variable !== null) &&
        (!Array.isArray(variable))
    );
}

function updateObject(obj, updates) {
    if (Array.isArray(obj) && updates.__type__ === 'array') {
        let sortedIndices = Object.keys(updates).filter(key => key !== '__type__' && key !== '__deleted__').map(index => Number(index)).sort().reverse();
        for (let i = 0; i < sortedIndices.length; i++) {
            let key = sortedIndices[i];
            if (updates[key]?.__deleted__ === true) {
                obj.splice(key, 1);
            } else if (updates[key].__type__ === 'array') {
                if (Array.isArray(obj[key])) {
                    updateObject(obj[key], updates[key]);
                } else {
                    obj[key] = updates[key];
                }
            } else if (isObject(updates[key]) && updates[key].__type__ !== 'array') {
                if (isObject(obj[key])) {
                    updateObject(obj[key], updates[key]);
                } else {
                    obj[key] = updates[key];
                }
            } else {
                obj[Number(key)] = updates[key];
            }
        }
    } else {
        for (let key in updates) {
            if (!obj.hasOwnProperty(key) && updates.hasOwnProperty(key)) {
                obj[key] = updates[key];
            } else if (obj.hasOwnProperty(key) && !updates.hasOwnProperty(key)) {
                delete obj[key];
            } else if (obj.hasOwnProperty(key) && updates.hasOwnProperty(key)) {
                if (isObject(obj[key]) && !isObject(updates[key])) {
                    obj[key] = updates[key];
                } else if (!isObject(obj[key]) && (isObject(updates[key] && updates.__type__ !== 'array'))) {
                    obj[key] = updates[key]
                } else if (
                    (isObject(obj[key]) && isObject(updates[key])) ||
                    (Array.isArray(obj[key]) && updates[key].__type__ === 'array')
                ) {
                    updateObject(obj[key], updates[key]);
                } else {
                    obj[key] = updates[key];
                }
            }
        }
    }
}

module.exports.updateObject = updateObject;
