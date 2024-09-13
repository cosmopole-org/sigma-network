import env from "../env";
import Storage from "./storage";

export default class Network {
    private store: Storage
    constructor(store: Storage) {
        this.store = store;
    }
    public async safelyRequest(layer: number, path: string, method: string, body: any): Promise<{success: boolean, result: any}> {
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
                return {success: (rawRes.status === 200), result: await rawRes.json()};
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
                return {success: (rawRes.status === 200), result: await rawRes.json()};
            }
        } catch (ex) {
            return { success: false, result: ex };
        }
    }
}