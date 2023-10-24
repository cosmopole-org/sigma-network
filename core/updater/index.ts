
import * as tower from './tower'
import * as room from './room'
import * as permission from './permission'
import * as invite from './invite'
import Update from './base'
import NetworkDriver from '../drivers/network/network'

let updatesDict = {
    tower,
    room,
    permission,
    invite
}

let buildUpdate = (requestId: string, path: { category: string, key: string }, ...args: Array<any>) => {
    let T = updatesDict[path.category][path.key]
    return new T(requestId, ...args)
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
    }
}

const registerUpdateType = <T extends Update>(type: T, path: { category: 'string', key: 'string'}) => {
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

export default {
    types,
    buildUpdate,
    registerUpdateType,
    group
}
