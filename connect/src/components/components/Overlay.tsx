import AppletHost from "./applet-host"
import { IconButton } from "@mui/material"
import { Close } from "@mui/icons-material"
import { colors } from "@nextui-org/theme"
import { Actions, States } from "@/api/client/states"
import { useEffect } from "react"
import { api } from "@/index"

const Overlay = () => {
    const overlayData = States.useListener(States.store.overlayData);
    const overlayLoaded = States.useListener(States.store.overlayLoaded);
    useEffect(() => {
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
            if (id && overlayData?.workerId && (id === overlayData?.workerId)) {
                if (data.key === 'onLoad') {
                    (document.getElementById(`safezone-${id}`) as any)?.contentWindow.postMessage({ key: 'setup', myHumanId: States.store.myUserId, colorName: "blue" }, 'https://gate.kproto.app:8443/')
                } else if (data.key === 'ready') {
                    if (!overlayData) {
                        (document.getElementById(`safezone-${id}`) as any)?.contentWindow.postMessage({ key: 'start' }, 'https://gate.kproto.app:8443/')
                    }
                } else if (data.key === 'ask') {
                    api.sigma.services?.topics.ask({ recvId: id, data: data.packet, spaceId: overlayData?.room.spaceId, topicId: overlayData?.room.id });
                }
            }
        }
        window.addEventListener('message', messageCallback)
        return () => {
            window.removeEventListener('message', messageCallback);
        }
    }, []);
    return overlayData ? (
        <div style={{ width: '100%', height: '100%', position: 'fixed', left: 0, top: 0, zIndex: 99999 }}>
            <div style={{
                width: '100%', height: '100%', position: 'fixed', left: 0, top: 0,
                backgroundColor: colors.blue[200],
                opacity: 0.35, transition: 'opacity 500ms'
            }} />
            <AppletHost.Host
                overlay={true}
                appletKey={overlayData.workerId}
                code={overlayData.code}
                room={overlayData.room}
                index={0}
                entry={'Test'}
                onCancel={() => {
                    Actions.updateOverlayData(null);
                }}
            />
            {
                !overlayLoaded ? (
                    <IconButton
                        onClick={() => Actions.updateOverlayData(null)}
                        style={{ position: 'absolute', top: 16, right: 16, borderRadius: '50%', backgroundColor: colors.blue[50] }}
                    >
                        <Close />
                    </IconButton>
                ) : null
            }
        </div>
    ) : null
}

export default Overlay
