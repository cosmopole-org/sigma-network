
// settingup ####################################################

let local = false;
let GATEWAY_ADDRESS = local ? 'localhost:3001' : 'https://sigverse.liara.run';
let PEERJS_ADDRESS = 'sigverse.liara.run'
let COTURN_ADDRESS = 'monopole-coturn.liara.run'
let AUDEIENCE = "https://dev-5dkibhg6w6hcq22l.us.auth0.com/api/v2/";
let AUTH0_DOMAIN = "dev-mgczpy88hh2fvv4s.eu.auth0.com";
let AUTH0_CLIENTID = "N84vxllIAsjG8v3ihA3EVEXGfQi6JaNE";
const publicVapidKey = "BNQ9TU-jAms67sRxUFLh6EsWGGVX6VlMB3PSSqblcUquY-QuSjkG8EZVTq0eVAf3YQoNIuynSDgPOlTEVj3_oMM";

// configuring ##################################################

// const audience = AUDEIENCE && AUDEIENCE !== "YOUR_API_IDENTIFIER"
    // ? AUDEIENCE
    // : null;
const config = {
    GATEWAY_ADDRESS,
    PEERJS_ADDRESS,
    COTURN_ADDRESS,
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENTID,
    publicVapidKey,
}
export default config

