
const { fetch, setGlobalDispatcher, Agent, Pool } = require("undici");
const WebSocket = require('ws');

// const serverUrl = "ws://localhost:8000";
const serverUrl = "https://midopia-football.liara.run";
const token = "DwrFz5b8FHpW7ZgSnYSN6wdEhQ8eEPfa";

const hello = async () => {
    let requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };
    let res = await fetch(`${serverUrl}/api/hello`, requestOptions);
    return await res.json();
}

const readLeaderboard = async () => {
    const myHeaders = new Headers();
    myHeaders.append("token", token);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "leagueLevel": 2
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    let res = await fetch(`${serverUrl}/players/readLeaderBoard`, requestOptions);
    let result = await res.json();
    console.log(result);
    return result;
}

const submitScore = async () => {
    const myHeaders = new Headers();
    myHeaders.append("token", token);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "result": "win",
        "goalP": 10,
        "goalN": 0,
        "leagueLevel": 2
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    let res = await fetch(`${serverUrl}/players/submitScore`, requestOptions);
    let result = await res.json();
    console.log(result);
    return result;
}

//const WebSocket = require('ws');

setGlobalDispatcher(
  new Agent({ factory: (origin) => new Pool(origin, { connections: 128 }) })
);

(async () => {
//     console.log(await hello());
//     let tasks = [];
//     for (let i = 0; i < 1000; i++) {
//         tasks.push(
//             new Promise((resolve, reject) => {
//                 readLeaderboard().then(resolve).catch(reject);
//             })
//         );
//         tasks.push(
//             new Promise((resolve, reject) => {
//                 submitScore().then(resolve).catch(reject);
//             })
//         );
//     }
//     await Promise.all(tasks);

    // const { pending } = await signup("keyhan 6");
    // console.log({ pending });
    // const { pending: pending2, human, session } = await verify(pending.clientCode, pending.verifyCode);
    // console.log({ pending: pending2, human, session });
    // if (pending2.state === 'verified') {
    //     const { human: human2, session: session2 } = await complete(pending.clientCode, pending.verifyCode, "Kasper", "Of Cosmopole");
    //     console.log(human2, session2);
    // }
    // const { human: human3 } = await update("Edward", "Kasperian");
    // console.log(human3);

    let requestDict = {};

    const request = (path, data, token) => {
        return new Promise(resolve => {
            let requestId = Math.random().toString().substring(2)
            requestDict[requestId] = resolve
            socket.send(`${path} ${token ?? "EMPTY_TOKEN"} 0 0 8081 ${requestId} ${JSON.stringify(data)}`);
        })
    }

    let socket = new WebSocket("ws://localhost:8081/ws");
    socket.onmessage = function (event) {
        let data = event.data.split(" ");
        if (data[0] === "update") {
            console.log(JSON.parse(event.data.substring(data[0].length)))
        } else {
            let resolve = requestDict[data[0]];
            if (resolve) {
                delete requestDict[data[0] + 1]
                resolve(JSON.parse(event.data.substring(data[0].length)))
            }
        }
    };
    socket.onopen = async function (e) {
        console.log("[open] Connection established");
        console.log("Sending to server");
        //let resultHello = await request(`/api/hello`, {});
        //console.log(resultHello);
        let result = await request(`/humans/signup`, { email: Date.now().toString() });
        console.log(result);
        let result2 = await request(`/humans/verify`, { verifyCode: result.pending.verifyCode, clientCode: result.pending.clientCode });
        console.log(result2);
        let result3 = await request(`/humans/complete`, { verifyCode: result.pending.verifyCode, clientCode: result.pending.clientCode, firstName: "Kasper", lastName: "Of Cosmopole" });
        console.log(result3);
        let result4 = await request(`/humans/get`, { userId: result3.human.id });
        console.log(result4);
        let result5 = await request(`/humans/update`, { firstName: "Keyhan", lastName: "Of Helloverse" }, result3.session.token);
        console.log(result5);
        let result6 = await request(`/humans/get`, { userId: result3.human.id });
        console.log(result6);

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
