
const { fetch, setGlobalDispatcher, Agent, Pool } = require("undici");
const WebSocket = require('ws');

setGlobalDispatcher(
    new Agent({ factory: (origin) => new Pool(origin, { connections: 128 }) })
);

(async () => {

    let myOrigin = "8081";

    let socket = new WebSocket(`ws://localhost:${myOrigin}/ws`);

    let requestDict = {};
    let requestOrigins = {}

    const authenticate = (token) => {
        return new Promise(resolve => {
            let requestId = Math.random().toString().substring(2)
            requestDict[requestId] = resolve
            requestOrigins[requestId] = "8081"
            socket.send(`authenticate ${token ?? "EMPTY_TOKEN"} ${requestId}`);
        })
    }

    const request = async (path, data, token, origin) => {
        return new Promise(resolve => {
            let requestId = Math.random().toString().substring(2)
            requestDict[requestId] = resolve
            requestOrigins[requestId] = origin ?? "8081"
            socket.send(`${path} ${token ?? "EMPTY_TOKEN"} ${origin ?? "8081"} ${requestId} ${JSON.stringify(data)}`);
        })
    }

    socket.onmessage = function (event) {
        console.log(event.data)
        let data = event.data.split(" ");
        if (data[0] === "noaction") {
            console.log(data[1], JSON.parse(event.data.substring(data[0].length + data[1].length + 1)))
        } else if (data[0] === "error") {
            console.log(data[1], JSON.parse(event.data.substring(data[0].length + data[1].length + 1)))
        } else if (data[0] === "update") {
            console.log(data[1], JSON.parse(event.data.substring(data[0].length + data[1].length + 1)))
        } else if (data[0] == "response") {
            let resolve = requestDict[data[1]];
            if (resolve) {
                delete requestDict[data[1]]
                resolve(JSON.parse(event.data.substring(data[0].length + data[1].length + 1)))
            }
        }
    };
    socket.onopen = async function (e) {
        console.log("[open] Connection established");
        console.log("Sending to server");

        let result5 = await authenticate("aIIpWGD_f6wrilXhnR9FD2Wop_pxLP7m");
        console.log(result5);

        // let result8 = await request(`/invites/accept`, { inviteId: 58 }, "aIIpWGD_f6wrilXhnR9FD2Wop_pxLP7m", "8082");
        // console.log(result8);

        let result9 = await request(`/rooms/create`, { towerId: 63, name: "welcomer...", avatarId: 125 }, "aIIpWGD_f6wrilXhnR9FD2Wop_pxLP7m", "8082");
        console.log(result9);
    };
    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            console.log('[close] Connection died');
        }
    };
    socket.onerror = function (error) {
        console.log(error);
    };
})();
