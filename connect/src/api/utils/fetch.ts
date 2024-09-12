import { getServerUrl } from "../offline/constants";
import { States } from "../offline/states";

const request = async (path: string, body: any, layer: number): Promise<any> => {
    const myHeaders = new Headers();
    myHeaders.append("layer", layer.toString());
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("token", States.getToken());

    const raw = JSON.stringify(body);

    const d = await fetch(`${getServerUrl()}/${path}`, {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    });
    return await d.json();
}

export {
    request
}