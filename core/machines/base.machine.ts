
import config from "config";
import Client from "../drivers/network/client";
import guardian from "../guardian";
import BaseService from "../services/base.service";
import fs from 'fs';
import path from 'path';

abstract class BaseMachine extends BaseService {
    abstract getName(): string
    abstract getService(): { [id: string]: any }
    abstract getClient(): string
    route(key: Array<string>, client: Client, body: any) {
        return new Promise(async (resolve, reject) => {
            let action = this.getService()
            for (let i = 0; i < key.length; i++) {
                action = action[key[i]]
            }
            if (action) {
                if (action.guardian.authenticate) {
                    if (!client.humanId) {
                        reject()
                        return
                    }
                }
                let report: any = undefined
                if (action.guardian.inRoom && !body['roomId']) {
                    reject()
                    return
                }
                if (action.guardian.authorize) {
                    let result = await guardian.authorize(client, body['towerId'], body['roomId'])
                    if (result?.granted) {
                        report = { towerId: body.towerId, rights: result.rights, roomId: result.roomId }
                    } else {
                        reject()
                        return
                    }
                }
                resolve(action.func(client, body, {
                    storage: {
                        write: async (relativePath: string, data: any) => {
                            if (body.roomId) {
                                let path = `${config.TEMP_STORAGE}/storage/${body.roomId}/${relativePath}`
                                let pathParts = path.split('/')
                                pathParts.pop()
                                await fs.promises.mkdir(pathParts.join('/'), { recursive: true })
                                await fs.promises.writeFile(path, data, { flag: "a+" })
                            }
                        },
                        remove: async (relativePath: string) => {
                            if (body.roomId) {
                                await fs.promises.rm(`${config.TEMP_STORAGE}/storage/${body.roomId}/${relativePath}`)
                            }
                        }
                    }
                }, report))
            } else {
                reject()
                return
            }
        })
    }
}

export default BaseMachine
