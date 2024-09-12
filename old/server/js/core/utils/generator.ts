import * as crypto from "crypto";

const makeUniqueId = () => {
    return crypto.randomBytes(16).toString("hex");
}

export {
    makeUniqueId
}
