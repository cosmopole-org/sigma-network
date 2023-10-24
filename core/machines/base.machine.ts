import Action from "./utils/action";
import Client from "../drivers/network/client";
import guardian from "../guardian";
import BaseService from "../services/base.service";

abstract class BaseMachine extends BaseService {
    abstract getName(): string
    abstract getService(): { [id: string]: Action }
    abstract getClient(): string
    route(key: string, client: Client, body: any,) {
        return new Promise(async (resolve, reject) => {
            let action = this.getService()[key]
            if (action) {
                if (action.guardian.authenticate) {
                    if (!client.humanId) {
                        reject()
                        return
                    }
                }
                let report = undefined
                if (action.guardian.authorize) {
                    let result = await guardian.authorize(client, body['towerId'], body['roomId'])
                    if (result?.granted) {
                        report = { towerId: body.towerId, rights: result.rights, roomId: result.roomId }
                    } else {
                        reject()
                        return
                    }
                }
                resolve(action.func(client, body, report))
            } else {
                reject()
                return
            }
        })
    }
}

export default BaseMachine
