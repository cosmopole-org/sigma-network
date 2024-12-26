import env from "../env";
import Storage from "./storage";

export default class Network {
    private store: Storage
    private ws?: WebSocket
    private wsHooks: { [key: string]: { [code: string]: (data: any) => void } }
    constructor(store: Storage) {
        this.store = store;
        this.wsHooks = {};
    }
    public instantiate = (callback?: () => void) => {
        this.ws = new WebSocket(env.WS_ADDRESS);
        let that = this;
        this.ws.onopen = async function (e) {
            console.log("[open] Connection established");
            console.log("Sending to server");
            setInterval(() => {
                this.send(`authenticate ${"EMPTY_TOKEN"} EMPTY`);
                console.log("sent keepalive packet.");
            }, 5000);
            that.authenticate();
            callback && callback();
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
                    let cb = that.wsHooks[a[1]];
                    if (cb) {
                        Object.values(cb).forEach(fn => {
                            fn(packet);
                        })
                    }
                }
            }
        };
    }
    public addWsEvent = (key: string, fn: (data: any) => void) => {
        let code = crypto.randomUUID().toString()
        if (!this.wsHooks[key]) this.wsHooks[key] = {};
        this.wsHooks[key][code] = fn;
        return {
            remove: () => {
                delete this.wsHooks[key][code];
            }
        };
    }
    public authenticate = () => {
        this.ws?.send(`authenticate ${this.store.token ?? "EMPTY_TOKEN"} EMPTY`);
    }
    public async safelyRequest(layer: number, path: string, method: string, body: any): Promise<{ success: boolean, result: any }> {
        try {
            if (method === 'GET') {
                const myHeaders = new Headers();
                myHeaders.append("layer", layer.toString());
                myHeaders.append("token", this.store.token);
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
                let rawRes = await fetch(`${env.SERVER_ADDRESS}/${path}`, {
                    method: method,
                    headers: myHeaders,
                    redirect: "follow"
                });
                return { success: (rawRes.status === 200), result: await rawRes.json() };
            } else {
                const myHeaders = new Headers();
                myHeaders.append("layer", layer.toString());
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("token", this.store.token);
                let rawRes = await fetch(`${env.SERVER_ADDRESS}/${path}`, {
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