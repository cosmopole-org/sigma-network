import { getUsers } from "../client/constants";

const genRandAvatar = () => (Math.floor(Math.random() * getUsers().length)).toString();

function stringToColour(name: string, colorsArr: string[]) {
    let hash = hashStr(name);
    let index = hash % colorsArr.length;
    return colorsArr[index];
}

function hashStr(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);
        hash += charCode;
    }
    return hash;
}

export {
    genRandAvatar,
    stringToColour
}