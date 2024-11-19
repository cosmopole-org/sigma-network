
import Api from 'api';
import { WebSocket } from 'ws';

class NetworkDriver {

    ws: WebSocket
    updateListeners: { [id: string]: (update: any) => void } = {}
    token: string

    constructor(api: Api, token: string) {
        this.token = token;
        this.ws = new WebSocket("wss://sigverse.liara.run/ws");
        let that = this;
        this.ws.onopen = async function (e) {
            console.log("[open] Connection established");
            console.log("Sending to server");
            that.authenticate(token);
            setInterval(() => {
                this.send(`authenticate ${"EMPTY_TOKEN"} EMPTY`);
                console.log("sent keepalive packet.");
            }, 5000);
        };
        this.ws.onclose = function (event) {
            if (event.wasClean) {
                console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                console.log('[close] Connection died');
            }
        };
        this.ws.onerror = function (error) {
            console.log(error);
        };
        this.ws.onmessage = async function (event) {
            console.log(event.data);
            let a = event.data.toString().split(" ");
            if (a.length >= 3) {
                let key = a[0];
                let body = event.data.toString().substring(a[0].length + 1 + a[1].length + 1);
                if (key === "update") {
                    let packet = JSON.parse(body);
                    let cb = that.updateListeners[a[1]];
                    if (cb) {
                        cb(packet);
                    }
                }
            }
        };
    }

    public authenticate = (token: string) => {
        this.ws.send(`authenticate ${token ?? "EMPTY_TOKEN"} EMPTY`);
    }

    addUpdateListener(key: string, callback: (update: any) => void) {
        this.updateListeners[key] = callback
    }

    public async safelyRequest(layer: number, path: string, method: string, body: any): Promise<{ success: boolean, result: any }> {
        try {
            if (method === 'GET') {
                const myHeaders = new Headers();
                myHeaders.append("layer", layer.toString());
                myHeaders.append("token", this.token);
                let params = Object.keys(body)
                if (params.length > 0) {
                    path += "?";
                    params.forEach(key => {
                        if (!path.endsWith("?")) {
                            path += "&";
                        }
                        path += (key + "=" + body[key]);
                    })
                }
                let rawRes = await fetch(`https://sigverse.liara.run/${path}`, {
                    method: method,
                    headers: myHeaders,
                    redirect: "follow"
                });
                return { success: (rawRes.status === 200), result: await rawRes.json() };
            } else {
                const myHeaders = new Headers();
                myHeaders.append("layer", layer.toString());
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("token", this.token);
                let rawRes = await fetch(`https://sigverse.liara.run/${path}`, {
                    method: method,
                    headers: myHeaders,
                    body: JSON.stringify(body),
                    redirect: "follow"
                });
                return { success: (rawRes.status === 200), result: await rawRes.json() };
            }
        } catch (ex) {
            return { success: false, result: ex };
        }
    }
}

export default NetworkDriver
