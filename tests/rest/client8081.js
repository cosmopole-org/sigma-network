
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

        // let result = await request(`/humans/signup`, { email: Date.now().toString() });
        // console.log(result);
        // let result2 = await request(`/humans/verify`, { verifyCode: result.pending.verifyCode, clientCode: result.pending.clientCode });
        // console.log(result2);
        // let result3 = await request(`/humans/complete`, { verifyCode: result.pending.verifyCode, clientCode: result.pending.clientCode, firstName: "Kasper", lastName: "Of Cosmopole" });
        // console.log(result3);

        let myId = 8;
        let token = "KWekCaSQI65RNqwt6PGsEE3-8YVfKvgE"

        let result5 = await authenticate(token);
        console.log(result5);

        // let result0 = await request(`/invites/create`, { recepientOrigin: "8082", humanId: 71, towerId: 12 }, token, "8081");
        // console.log(result0);

        // let result0 = await request(`/invites/cancel`, { inviteId: 65 }, token, "8082");
        // console.log(result0);

        // let result8 = await request(`/invites/accept`, { inviteId: 64 }, "hEq-J0RrK5ERaab255cIpNrFgnmIqXaD", "8082");
        // console.log(result8);

        // let result4 = await request(`/towers/create`, { name: "welcome from 8081", avatarId: 123, isPublic: false }, token);
        // console.log(result4);

        let towerId = 12

        // let result10 = await request(`/rooms/create`, { towerId: towerId, name: "welcomer...", avatarId: 125 }, token, "8081");
        // console.log(result10);

        let roomId = 3;

        // let result7 = await request(`/machines/create`, { name: "testMachine", avatarId: 12374 }, token, "8081");
        // console.log(result7);

        let machineToken = "iX57SHIkmH8hBXX_2zIQty1Tm4uozocj";
        let machineId = 2;

        // let result8 = await request(`/workers/create`, { machineId: machineId, metadata: "{}", towerId: towerId, roomId: roomId, workerOrigin: '8081' }, token, "8081");
        // console.log(result8);

        let workerId = 5;

        let result8 = await request(`/rooms/send`, { type: "single", recvId: 71, recvType: "human", recvOrigin: "8082", data: `{ "hello": "hehe hoohoo hihi" }`, towerId: towerId, roomId: roomId }, token, "8081");
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
