import { useEffect, useRef, useState } from "react"
import $ from 'jquery'
import { Actions, States } from "@/api/client/states"
import { colors } from "@nextui-org/theme"
import { api } from "@/index"
import Loading from "./Loading"
import { Topic } from "@/api/sigma/models"

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

export let saveFrame = () => { };

const Safezone = (props: { stateKey?: string, isWidget?: boolean, code: string, machineId?: string, workerId?: string, room?: Topic, onCancel: () => void, overlay?: boolean }) => {
    let id = props.room ? props.workerId : props.machineId
    if (!id) id = ''
    const [show, setShow] = useState(false)
    const [ready, setReady] = useState(false)
    const preparedIframeData = useRef('')
    const identifier = props.room ? `safezone-${props.workerId}` : `safezone-${props.machineId}`
    let url = props.code.substring('safezone/'.length);
    const lastStateKey = useRef("");
    if (!props.isWidget) {
        if (props.stateKey && (lastStateKey.current !== props.stateKey)) {
            lastStateKey.current = props.stateKey;
            (window as any).prepareFrame(identifier, url);
        }
    }
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
                    setShow(true)
                    setReady(true)
                }
            }
        } else {
            if (!show) setShow(true)
            if (!ready) setReady(true)
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
                    (document.getElementById(`safezone-${workerId}`) as any)?.contentWindow.postMessage({ key: 'setup', myHumanId: States.store.myUserId, themeColor: colors.blue, colorName: "blue" }, 'https://gate.kproto.app:8443/')
                } else if (data.key === 'ready') {
                    if (!show) {
                        (document.getElementById(`safezone-${workerId}`) as any)?.contentWindow.postMessage({ key: 'start' }, 'https://gate.kproto.app:8443/')
                        setShow(true)
                    }
                } else if (data.key === 'ask') {
                    if (props.room) {
                        api.sigma.services?.topics.ask({ recvId: workerId.startsWith('desktop-sheet-') ? workerId.substring('desktop-sheet-'.length) : workerId, data: data.packet, spaceId: props.room.spaceId, topicId: props.room.id });
                    }
                } else if (data.key === 'done') {
                    Actions.updateOverlayData(null)
                } else if (data.key === 'onAuthorize') {
                    setReady(true)
                }
            }
        }
        window.addEventListener('message', messageCallback)
        let packetReceiver = api.sigma.services?.topics.onPacketReceive((packet: any) => {
            let data = packet.data;
            if (data.tag === 'get/widget' || data.tag === 'get/applet') return;
            if (data.type === "response") {
                if (props.workerId) {
                    let wi = props.workerId.startsWith('desktop-sheet-') ? props.workerId.substring('desktop-sheet-'.length) : props.workerId;
                    if (packet.member.id === wi) {
                        (document.getElementById(identifier) as any)?.contentWindow.postMessage({ key: 'response', packet: data }, 'https://gate.kproto.app:8443/')
                    }
                } else {
                    (document.getElementById(identifier) as any)?.contentWindow.postMessage({ key: 'response', packet: data }, 'https://gate.kproto.app:8443/')
                }
            } else if (data.type === "push") {
                if (props.workerId) {
                    let wi = props.workerId.startsWith('desktop-sheet-') ? props.workerId.substring('desktop-sheet-'.length) : props.workerId;
                    if (packet.member.id === wi) {
                        (document.getElementById(identifier) as any)?.contentWindow.postMessage({ key: 'push', packet: data }, 'https://gate.kproto.app:8443/')
                    }
                } else {
                    (document.getElementById(identifier) as any)?.contentWindow.postMessage({ key: 'push', packet: data }, 'https://gate.kproto.app:8443/')
                }
            }
        });
        return () => {
            packetReceiver?.remove();
            window.removeEventListener('message', messageCallback)
        }
    }, [])
    if (props.isWidget) {
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
                                    slot="frameStore"
                                    name={identifier}
                                    key={identifier}
                                    id={identifier}
                                    frameBorder={0}
                                    width="100%"
                                    height="100%"
                                    src={`${url}`}
                                    style={{ opacity: show ? 1 : 0, transition: 'opacity 500ms' }}
                                />
                            ) : null : (
                            <iframe
                                slot="frameStore"
                                name={identifier}
                                key={identifier}
                                id={identifier}
                                frameBorder={0}
                                width="100%"
                                height="100%"
                                src={`https://gate.kproto.app:8443/${url}`}
                                style={{ opacity: show ? 1 : 0, transition: 'opacity 500ms' }}
                            />
                        )
                }
                {
                    (!props.code || (props.code && props.code?.startsWith('safezone/') && !ready)) ? (
                        <Loading isWidget={props.isWidget} overlay={props.overlay} key={'safezone-loading'} onCancel={() => {
                            setReady(false)
                            props.onCancel()
                        }} />
                    ) : null
                }
            </div>
        )
    } else {
        return <div/>
    }
}

export default Safezone;
