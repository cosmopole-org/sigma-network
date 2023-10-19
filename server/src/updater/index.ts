
import * as tower from './tower'

let updatesDict = {
    tower
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

export default {
    types,
    buildUpdate
}
