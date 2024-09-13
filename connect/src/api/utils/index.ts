import { getUsers } from "../client/constants";

const genRandAvatar = () => (Math.floor(Math.random() * getUsers().length)).toString();

export {
    genRandAvatar
}