
const { fetch, setGlobalDispatcher, Agent, Pool } = require("undici");
const WebSocket = require('ws');

setGlobalDispatcher(
    new Agent({ factory: (origin) => new Pool(origin, { connections: 128 }) })
);

(async () => {

    let socket = new WebSocket("ws://localhost:8082/ws");

    let requestDict = {};

    const authenticate = (token) => {
        return new Promise(resolve => {
            let requestId = Math.random().toString().substring(2)
            requestDict[requestId] = resolve
            socket.send(`authenticate ${token ?? "EMPTY_TOKEN"} ${requestId}`);
        })
    }

    const request = (path, data, token, origin) => {
        return new Promise(resolve => {
            let requestId = Math.random().toString().substring(2)
            requestDict[requestId] = resolve
            socket.send(`${path} ${token ?? "EMPTY_TOKEN"} ${origin ?? "8082"} ${requestId} ${JSON.stringify(data)}`);
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
        // let result = await request(`/humans/signup`, { email: Date.now().toString() });
        // console.log(result);
        // let result2 = await request(`/humans/verify`, { verifyCode: result.pending.verifyCode, clientCode: result.pending.clientCode });
        // console.log(result2);
        // let result3 = await request(`/humans/complete`, { verifyCode: result.pending.verifyCode, clientCode: result.pending.clientCode, firstName: "Kasper", lastName: "Of Cosmopole" });
        // console.log(result3);

        let token = "H9x_1PHl3oR7Mc7d8t6LKYoVDSh0mAyn"

        let result5 = await authenticate(token);
        console.log(result5);

        // let result8 = await request(`/invites/accept`, { inviteId: 1 }, token, "8081");
        // console.log(result8);

        // let result4 = await request(`/towers/create`, { name: "welcome", avatarId: 123, isPublic: false }, result3.session.token);
        // console.log(result4);
        // let result10 = await request(`/rooms/create`, { towerId: result4.tower.id, name: "welcomer...", avatarId: 125 }, result3.session.token, "8082");
        // console.log(result10);

        // let result8 = await request(`/invites/create`, { humanId: 7, towerId: result4.tower.id, recepientOrigin: "8081" }, result3.session.token, "8082");
        // console.log(result8);

        // let result8 = await request(`/machines/create`, { name: "testMachine", avatarId: 123 }, token, "8082");
        // console.log(result8);

        let towerId = 12;
        let roomId = 3;
        let workerId = 5;

        let result8 = await request(`/rooms/send`, { type: "broadcast", data: `{ "hello": "hehe hoohoo hihi" }`, towerId: towerId, roomId: roomId }, token, "8081");
        console.log(result8);
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
