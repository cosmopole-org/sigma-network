
import * as tower from './tower'
import * as room from './room'
import * as permission from './permission'
import * as invite from './invite'
import * as worker from './worker'
import Update from './base'
import NetworkDriver from '../drivers/network/network'

let updatesDict = {
    tower,
    room,
    permission,
    invite,
    worker
}

let buildUpdate = (requestId: string, path: { category: string, key: string }, ...args: Array<any>) => {
    let T = updatesDict[path.category][path.key]
    let updateObject = new T(requestId, ...args)
    updateObject.type = `${path.category}/${path.key}`
    return updateObject
}

let types = {
    tower: {
        onUpdate: { category: 'tower', key: 'onUpdate' },
        onRemove: { category: 'tower', key: 'onRemove' },
        onHumanJoin: { category: 'tower', key: 'onHumanJoin' }
    },
    room: {
        onCreate: { category: 'room', key: 'onCreate' },
        onUpdate: { category: 'room', key: 'onUpdate' },
        onRemove: { category: 'room', key: 'onRemove' },
    },
    permission: {
        onUpdate: { category: 'permission', key: 'onUpdate' },
    },
    invite: {
        onCreate: { category: 'invite', key: 'onCreate' },
        onCancel: { category: 'invite', key: 'onCancel' },
        onAccept: { category: 'invite', key: 'onAccept' },
        onDecline: { category: 'invite', key: 'onDecline' }
    },
    worker: {
        onRequest: { category: 'worker', key: 'onRequest' },
        onResponse: { category: 'worker', key: 'onResponse' },
        onPush: { category: 'worker', key: 'onPush' }
    },
}

const registerUpdateType = <T extends Update>(type: T, path: { category: string, key: string}) => {
    if (!types[path.category]) {
        types[path.category] = {}
        updatesDict[path.category] = {}
    }
    types[path.category][path.key] = path
    updatesDict[path.category][path.key] = type
}

const group = (towerId: string) => {
    return NetworkDriver.instance.group(towerId)
}

export default class Updater {
    static _instance: Updater
    public static get instance() {
        return Updater._instance
    }
    public static initialize() {
        return new Updater()
    }
    types = types
    buildUpdate = buildUpdate
    registerUpdateType = registerUpdateType
    group = group
    constructor() {
        Updater._instance = this
    }
}
