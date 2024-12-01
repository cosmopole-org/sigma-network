
import { useEffect } from 'react';
import { api } from '../..';
import { State, hookstate } from '@hookstate/core';
import { Topic } from '@/api/sigma/models';
import { States } from '@/api/client/states';
import { colors } from '@nextui-org/theme';

let safezoneRunning = false
class SafeZoneController {
    private static _instance: SafeZoneController
    static get instance() {
        return SafeZoneController._instance
    }
    private safezones: { [id: string]: SafeZoneUnit }
    constructor() {
        SafeZoneController._instance = this
        this.safezones = {}
    }
    findById(id: string) {
        return this.safezones[id]
    }
    create(props: { room?: Topic, id: string }) {
        if (this.safezones[props.id]) {
            this.safezones[props.id].reset()
        } else {
            this.safezones[props.id] = new SafeZoneUnit(props)
        }
    }
}

class SafeZoneUnit {
    static types = {
        WIDGET: 'widget',
        ROOM_APPLET: 'room_applet',
        GLOBAL_APPLET: 'global_applet'
    }
    shown: State<boolean>
    ready: State<boolean>
    room?: Topic
    machineId?: string
    workerId?: string
    constructor(props: { room?: Topic, id: string }) {
        this.room = props.room
        if (this.room) {
            this.workerId = props.id
        } else {
            this.machineId = props.id
        }
        this.ready = hookstate(false)
        this.shown = hookstate(false)
    }
    reset() {
        this.ready.set(false)
        this.shown.set(false)
    }
}

const useSafezone = () => {
    const accessSafeZoneController = () => {
        return SafeZoneController.instance
    }
    if (!accessSafeZoneController()) new SafeZoneController()
    useEffect(() => {
        if (!safezoneRunning) {
            const messageCallback = (e: any) => {
                let id = undefined
                let iframes = document.getElementsByTagName('iframe');
                for (let i = 0, iframe, win; i < iframes.length; i++) {
                    iframe = iframes[i];
                    win = iframe.contentWindow
                    if (win === e.source) {
                        id = iframe.id.substring('safezone-'.length)
                        break
                    }
                }
                let data = e.data
                if (id) {
                    let safezone = accessSafeZoneController().findById(id)
                    if (data.key === 'onLoad') {
                        (document.getElementById(`safezone-${id}`) as any)?.contentWindow.postMessage({ key: 'setup', myHumanId: States.store.myUserId, colorName: "blue" }, 'https://safezone.liara.run/')
                    } else if (data.key === 'ready') {
                        if (!safezone.shown.get({ noproxy: true })) {
                            (document.getElementById(`safezone-${id}`) as any)?.contentWindow.postMessage({ key: 'start' }, 'https://safezone.liara.run/')
                            safezone.shown.set(true)
                        }
                    } else if (data.key === 'ask') {
                        let packet = data.packet
                        let r = safezone.room as Topic
                        api.sigma.store.db.collections.members.findOne({ selector: { userId: { $eq: api.sigma.store.myUserId }, spaceId: { $eq: r.spaceId } } }).exec().then((member: any) => {
                            api.sigma.services?.topics.send({ data: packet, spaceId: r.spaceId, topicId: r.id, memberId: member.id, type: 'single', recvId: id });
                        });
                    }
                }
            }
            window.addEventListener('message', messageCallback)
            safezoneRunning = true
        }
    }, [])
    return { accessSafeZoneController }
}

export default useSafezone
