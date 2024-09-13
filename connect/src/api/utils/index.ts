import { getServerUrl } from "../client/constants";
import { States } from "../client/states";

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

const genRandAvatar = () => (Math.floor(Math.random() * 20)).toString();

export {
    request,
    genRandAvatar
}