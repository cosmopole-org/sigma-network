
import config from "config";
import Client from "../drivers/network/client";
import BaseService from "../services/base.service";
import fs from 'fs';
import express from 'express'
import Guardian from "../guardian";

abstract class BaseMachine extends BaseService {
    abstract getName(): string
    abstract getService(): { [id: string]: any }
    abstract getClient(): string
    route(key: Array<string>, client: Client, body: any) {
        return new Promise(async (resolve, reject) => {
            let action = this.getService()
            for (const element of key) {
                action = action[element]
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
                    let result = await Guardian.instance.authorize(client, body['towerId'], body['roomId'])
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
    routeRest(key: Array<string>, client: Client, req: express.Request, res: express.Response) {
        return new Promise(async (resolve, reject) => {
            let action = this.getService()
            for (let i = 0; i < key.length; i++) {
                action = action[key[i]]
            }
            if (action) {
                if (action.guardian.authenticate) {
                    if (!client?.humanId) {
                        reject(2)
                        return
                    }
                }
                let report: any = undefined
                if (action.guardian.inRoom && !req.headers['roomid']) {
                    reject(3)
                    return
                }
                if (action.guardian.authorize) {
                    let result = await Guardian.instance.authorize(client, req.headers['towerid']?.toString(), req.headers['roomid'].toString())
                    if (result?.granted) {
                        report = { towerId: req.headers['towerid'].toString(), rights: result.rights, roomId: req.headers['roomid'].toString() }
                    } else {
                        reject(4)
                        return
                    }
                }
                resolve(action.func(client, req, res, {
                    storage: {
                        write: async (relativePath: string, data: any) => {
                            if (req.headers['roomid']) {
                                let path = `${config.TEMP_STORAGE}/storage/${req.headers['roomid'].toString()}/${relativePath}`
                                let pathParts = path.split('/')
                                pathParts.pop()
                                await fs.promises.mkdir(pathParts.join('/'), { recursive: true })
                                await fs.promises.writeFile(path, data, { flag: "a+" })
                            }
                        },
                        remove: async (relativePath: string) => {
                            if (req.headers['roomid']) {
                                await fs.promises.rm(`${config.TEMP_STORAGE}/storage/${req.headers['roomid'].toString()}/${relativePath}`)
                            }
                        }
                    }
                }, report))
            } else {
                reject(5)
                return
            }
        })
    }
}

export default BaseMachine
