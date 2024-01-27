
const serverUrl = "ws://localhost:8000";
//const serverUrl = "wss://sigma-sample.liara.run";

const hello = async () => {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };
    let res = await fetch(`${serverUrl}/api/hello`, requestOptions);
    return await res.json();
}

const signup = async (email) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "email": email
    });
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    let res = await fetch(`${serverUrl}/humans/signup`, requestOptions);
    return await res.json();
}

const verify = async (cc, vc) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "clientCode": cc,
        "verifyCode": vc
    });
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    let res = await fetch(`${serverUrl}/humans/verify`, requestOptions);
    return await res.json();
}

const complete = async (cc, vc, firstName, lastName) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "clientCode": cc,
        "verifyCode": vc,
        "firstName": firstName,
        "lastName": lastName
    });
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    let res = await fetch(`${serverUrl}/humans/complete`, requestOptions);
    return await res.json();
}

const update = async (firstName, lastName) => {
    var myHeaders = new Headers();
    myHeaders.append("token", "Pw-X3rl-nY3VqelIqQupeUoMZPTD5LJr");
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "firstName": firstName,
        "lastName": lastName
    });
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    let res = await fetch(`${serverUrl}/humans/update`, requestOptions);
    return await res.json();
}

const WebSocket = require('ws');

(async () => {
    // console.log(await hello());
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

    const request = (path, data) => {
        return new Promise(resolve => {
            let requestId = Math.random().toString().substring(2)
            requestDict[requestId] = resolve
            socket.send(`${path} ${requestId} ${JSON.stringify(data)}`);
        })
    }

    let socket = new WebSocket(serverUrl);
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
        let resultHello = await request(`/api/hello`, {});
        console.log(resultHello);
        let result = await request(`/humans/signup`, { email: Date.now().toString() });
        console.log(result);
        let result2 = await request(`/humans/verify`, { verifyCode: result.pending.verifyCode, clientCode: result.pending.clientCode });
        console.log(result2);
        let result3 = await request(`/humans/complete`, { verifyCode: result.pending.verifyCode, clientCode: result.pending.clientCode, firstName: "Kasper", lastName: "Of Cosmopole" });
        console.log(result3);
        let resultAuth = await request(`/auth/login`, { token: result3.session.token })
        console.log(resultAuth);
        let result4 = await request(`/towers/join`, { token: result3.session.token, towerId: 28 })
        console.log(result4);
    };
    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            console.log('[close] Connection died');
        }
    };
    socket.onerror = function (error) {
        console.log(`[error]`);
    };
})();
