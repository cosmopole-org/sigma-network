import { memo, useEffect, useRef } from "react"
import { api } from "../../.."
import { useHookstate } from "@hookstate/core"
import useSafezone from "../../hooks/useSafezone"
import IRoom from "../../../api/models/room"
import { overlaySafezoneData } from "./Overlay"
import { themeColor, themeColorName } from "../../../App"
import Loading from "./Loading"
import $ from 'jquery'

const safeOrigins = [
    'https://open.spotify.com/embed/'
]
const isSafe = (u: string) => {
    let found = false;
    safeOrigins.forEach((o: string) => {
        if (u.startsWith(o)) found = true;
    })
    return found;
}

const Safezone = (props: { isWidget?: boolean, code: string, machineId?: string, workerId?: string, room?: IRoom, onCancel: () => void, overlay?: boolean }) => {
    const safezoneRepo = useSafezone()
    const randomPostFix = useRef(Math.random())
    let id = props.room ? props.workerId : props.machineId
    if (!id) id = ''
    if (!safezoneRepo.accessSafeZoneController().findById(id)) {
        safezoneRepo.accessSafeZoneController().create({ room: props.room, id })
    }
    let safezone = safezoneRepo.accessSafeZoneController().findById(id)
    const showState = useHookstate(safezone?.shown)
    const readyState = useHookstate(safezone?.ready)
    const show = showState?.get({ noproxy: true })
    const ready = readyState?.get({ noproxy: true })
    const preparedIframeData = useRef('')
    const identifier = props.room ? `safezone-${props.workerId}` : `safezone-${props.machineId}`
    let url = props.code.substring('safezone/'.length)
    if (url.startsWith('<iframe ')) {
        if (preparedIframeData.current.length === 0) {
            let doc = new DOMParser().parseFromString(url, "text/xml");
            let iframe = doc.documentElement as HTMLIFrameElement;
            if (iframe) {
                let xmlEl = $(doc.documentElement.outerHTML)[0] as any
                xmlEl.style.height = '100%';
                xmlEl.height = '100%';
                xmlEl.style.width = '100%';
                xmlEl.width = '100%';
                xmlEl.onload = 'alert("loaded")';
                if (isSafe(xmlEl.src)) {
                    preparedIframeData.current = xmlEl.outerHTML
                    showState.set(true)
                    readyState.set(true)
                }
            }
        } else {
            if (!show) showState.set(true)
            if (!ready) readyState.set(true)
        }
    }
    useEffect(() => {
        const messageCallback = (e: any) => {
            let workerId = undefined
            let iframes = document.getElementsByTagName('iframe');
            for (let i = 0, iframe, win; i < iframes.length; i++) {
                iframe = iframes[i];
                win = iframe.contentWindow
                if (win === e.source) {
                    workerId = iframe.id.substring('safezone-'.length)
                    break
                }
            }
            let data = e.data
            if (workerId && (workerId === id)) {
                if (data.key === 'onLoad') {
                    (document.getElementById(`safezone-${workerId}`) as any)?.contentWindow.postMessage({ key: 'setup', myHumanId: api.memory.myHumanId.get({ noproxy: true }), themeColor: themeColor.get({ noproxy: true }), colorName: themeColorName.get({ noproxy: true }) }, 'https://safezone.liara.run/')
                } else if (data.key === 'ready') {
                    if (!show) {
                        (document.getElementById(`safezone-${workerId}`) as any)?.contentWindow.postMessage({ key: 'start' }, 'https://safezone.liara.run/')
                        showState.set(true)
                    }
                } else if (data.key === 'ask') {
                    let packet = data.packet
                    if (props.room) {
                        let wi = workerId.startsWith('desktop-sheet-') ? workerId.substring('desktop-sheet-'.length) : workerId
                        api.services.worker.use({ packet, towerId: props.room.towerId, roomId: props.room.id, workerId: wi })
                    }
                } else if (data.key === 'done') {
                    overlaySafezoneData.set(undefined)
                } else if (data.key === 'onAuthorize') {
                    readyState.set(true)
                }
            }
        }
        window.addEventListener('message', messageCallback)
        let eventController = api.services.worker.onMachinePacketDeliver(`response-${identifier}`, 'response', (data: any) => {
            if (props.workerId) {
                let wi = props.workerId.startsWith('desktop-sheet-') ? props.workerId.substring('desktop-sheet-'.length) : props.workerId;
                if (data.workerId === wi) {
                    (document.getElementById(identifier) as any)?.contentWindow.postMessage({ key: 'response', packet: data }, 'https://safezone.liara.run/')
                }
            } else {
                (document.getElementById(identifier) as any)?.contentWindow.postMessage({ key: 'response', packet: data }, 'https://safezone.liara.run/')
            }
        })
        let eventController2 = api.services.worker.onMachinePacketDeliver(`push-${identifier}`, 'push', (data: any) => {
            if (props.workerId) {
                let wi = props.workerId.startsWith('desktop-sheet-') ? props.workerId.substring('desktop-sheet-'.length) : props.workerId;
                if (data.workerId === wi) {
                    (document.getElementById(identifier) as any)?.contentWindow.postMessage({ key: 'push', packet: data }, 'https://safezone.liara.run/')
                }
            } else {
                (document.getElementById(identifier) as any)?.contentWindow.postMessage({ key: 'push', packet: data }, 'https://safezone.liara.run/')
            }
        })
        return () => {
            safezone.reset()
            window.removeEventListener('message', messageCallback)
            eventController.unregister()
            eventController2.unregister()
        }
    }, [])
    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {
                url.startsWith('<iframe ') ? (
                    <div
                        key={identifier}
                        id={identifier}
                        style={{ width: '100%', height: '100%' }}
                        dangerouslySetInnerHTML={{ __html: preparedIframeData.current }}
                    />
                ) : url.startsWith('https://') ?
                    isSafe(url) ?
                        (
                            <iframe
                                name={identifier}
                                key={identifier}
                                id={identifier}
                                frameBorder={0}
                                width="100%"
                                height="100%"
                                src={`${url}?random=${randomPostFix.current}`}
                                style={{ opacity: show ? 1 : 0, transition: 'opacity 500ms' }}
                            />
                        ) : null : (
                        <iframe
                            name={identifier}
                            key={identifier}
                            id={identifier}
                            frameBorder={0}
                            width="100%"
                            height="100%"
                            src={`https://safezone.liara.run/${url}?random=${randomPostFix.current}`}
                            style={{ opacity: show ? 1 : 0, transition: 'opacity 500ms' }}
                        />
                    )
            }
            {
                (!props.code || (props.code && props.code?.startsWith('safezone/') && !ready)) ? (
                    <Loading isWidget={props.isWidget} overlay={props.overlay} key={'safezone-loading'} onCancel={() => {
                        readyState.set(false)
                        props.onCancel()
                    }} />
                ) : null
            }
        </div>
    )
}

export default memo(Safezone, () => true)
