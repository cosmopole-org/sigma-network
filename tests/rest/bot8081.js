
const { fetch, setGlobalDispatcher, Agent, Pool } = require("undici");
const WebSocket = require('ws');

setGlobalDispatcher(
    new Agent({ factory: (origin) => new Pool(origin, { connections: 128 }) })
);

(async () => {

    let socket = new WebSocket(`ws://cosmopole.liara.run/ws`);

    let requestDict = {};
    let requestOrigins = {}

    const authenticate = (token) => {
        return new Promise(resolve => {
            let requestId = Math.random().toString().substring(2)
            requestDict[requestId] = resolve
            requestOrigins[requestId] = "localhost->8081"
            socket.send(`authenticate ${token ?? "EMPTY_TOKEN"} ${requestId}`);
        })
    }

    const request = async (path, data, token, origin) => {
        return new Promise(resolve => {
            let requestId = Math.random().toString().substring(2)
            requestDict[requestId] = resolve
            requestOrigins[requestId] = origin ?? "localhost->8081"
            socket.send(`${path} ${token ?? "EMPTY_TOKEN"} ${origin ?? "localhost->8081"} ${requestId} ${JSON.stringify(data)}`);
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

        let token = "EjXb2xngEttYV9vl-s5v_JuP65JJRWKT"

        let result5 = await authenticate(token);
        console.log(result5);

        let result8 = await request(`/humans/get`, { userId: 1 }, "EjXb2xngEttYV9vl-s5v_JuP65JJRWKT", "monopole.liara.run");
        console.log(result8);

        // let result8 = await request(`/invites/accept`, { inviteId: 64 }, "hEq-J0RrK5ERaab255cIpNrFgnmIqXaD", "localhost->8082");
        // console.log(result8);

        // let result10 = await request(`/rooms/create`, { towerId: 70, name: "welcomer...", avatarId: 125 }, "hEq-J0RrK5ERaab255cIpNrFgnmIqXaD", "localhost->8082");
        // console.log(result10);

        // let result8 = await request(`/workers/create`, { machineId: 1, metadata: "{}", towerId: 70, roomId: 51, workerOrigin: 'localhost->8082' }, token, "localhost->8082");
        // console.log(result8);
        
        // let towerId = 12
        // let roomId = 3;
        // let workerId = 5;

        // let result8 = await request(`/rooms/send`, { type: "single", recvId: 8, recvType: "human", recvOrigin: "localhost->8081", data: `{ "hello": "hehe hoohoo hihi" }`, workerId: workerId, towerId: towerId, roomId: roomId }, token, "localhost->8081");
        // console.log(result8);
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
