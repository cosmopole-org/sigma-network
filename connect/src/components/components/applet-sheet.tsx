import * as React from 'react';
import { SwipeableDrawer, Typography, createTheme } from '@mui/material';
import AppletHost from './applet-host';
import { Topic } from '@/api/sigma/models';
import { Button } from '@nextui-org/button';
import { colors } from '@nextui-org/theme';
import { api } from '@/index';
import { Actions, States, useTheme } from '@/api/client/states';
import { Card, Spinner } from '@nextui-org/react';
import IconButton from '../elements/icon-button';
import Icon from '../elements/icon';

let openAppletSheet = (_room: Topic, _workerId: string) => { }
let closeAppletSheet = () => { }
let notifyAppletSheetReady = () => { }
let appletsheetOpen = false

const theme = createTheme({
    transitions: {
        duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            // most basic recommended timing
            standard: 300,
            // this is to be used in complex animations
            complex: 375,
            // recommended when something is entering screen
            enteringScreen: 225,
            // recommended when something is leaving screen
            leavingScreen: 195,
        },
    },
})

const AppletSheet = () => {
    const [code, setCode]: [any, any] = React.useState(undefined)
    const { theme: appTheme } = useTheme();
    const workerIdRef: any = React.useRef(undefined)
    const roomRef: any = React.useRef(undefined)
    const appletShown = States.useListener(States.store.appletShown);
    React.useEffect(() => {
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
            if (id && (id === workerIdRef.current)) {
                if (data.key === 'onLoad') {
                    (document.getElementById(`safezone-${id}`) as any)?.contentWindow.postMessage({ key: 'setup', myHumanId: States.store.myUserId, colorName: "blue" }, 'https://safezone.liara.run/')
                } else if (data.key === 'ready') {
                    if (!States.store.appletShown.get({ noproxy: true })) {
                        (document.getElementById(`safezone-${id}`) as any)?.contentWindow.postMessage({ key: 'start' }, 'https://safezone.liara.run/')
                        setTimeout(() => {
                            Actions.switchAppletShown(false);
                            Actions.switchAppletLoaded(false);
                        });
                    }
                } else if (data.key === 'ask') {
                    api.sigma.services?.topics.ask({ recvId: id, data: data.packet, spaceId: roomRef.current.spaceId, topicId: roomRef.current.id });
                }
            }
        }
        window.addEventListener('message', messageCallback)
        let getAppletEvent = api.sigma.services?.topics.onPacketReceive((packet: any) => {
            if (packet.member.id === workerIdRef.current) {
                let data = packet.data;
                if (data.tag === 'get/applet') {
                    if (packet.member.id === workerIdRef.current) {
                        setCode(data.code)
                    }
                }
            }
        })
        return () => {
            getAppletEvent?.remove()
            window.removeEventListener('message', messageCallback)
        }
    }, [])
    closeAppletSheet = () => Actions.switchAppletShown(false)
    openAppletSheet = (room: Topic, workerId: string) => {
        workerIdRef.current = workerId
        roomRef.current = room
        Actions.switchAppletShown(true)
        api.sigma.store.db.collections.members.findOne({ selector: { userId: { $eq: api.sigma.store.myUserId }, spaceId: { $eq: room.spaceId } } }).exec().then((member: any) => {
            api.sigma.services?.topics.send({ type: "single", spaceId: room.spaceId, topicId: room.id, memberId: member.id, recvId: workerId, data: { tag: 'get/applet', theme: appTheme, secondaryColor: colors.purple, colorName: "blue", colors: colors.blue } })
        });
    }
    const [full, setFull] = React.useState(false)
    appletsheetOpen = appletShown
    return (
        <React.Fragment>
            <SwipeableDrawer anchor='bottom' open={appletShown} onOpen={() => { }} onClose={() => {
                Actions.switchAppletLoaded(false)
                setCode(undefined)
                Actions.switchAppletShown(false)
            }}
                disableSwipeToOpen

                SlideProps={{
                    onEntering: (node) => {
                        node.style.transition = theme.transitions.create(['transform', 'margin', 'height', 'width', 'top', 'left'], {
                            easing: theme.transitions.easing.easeOut,
                            duration: '250ms',
                        });
                    },
                }}

                PaperProps={{
                    style: {
                        borderRadius: full ? 0 : '24px 24px 0px 0px',
                        minHeight: window.innerHeight * 80 / 100 + 'px',
                        height: (full ? window.innerHeight : (window.innerHeight * 80 / 100)) + 'px',
                        backgroundColor: appTheme === "light" ? '#eee' : '#1b2730',
                        overflowY: 'auto'
                    }
                }}
            >
                <div style={{ width: '100%', position: 'relative', height: 32 }}>
                    {full ? null : <Card style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 100, height: 6, borderRadius: 3, background: '#666', top: 12 }} />}
                    <IconButton
                        name={full ? 'close' : 'fullscreen'}
                        iconType='circle'
                        color={appTheme === 'light' ? '#666' : '#fff'}
                        style={{ position: 'absolute', right: 4, top: 4 }}
                        onClick={() => setFull(!full)}
                    />
                </div>
                <AppletHost.Host
                    appletKey={'desktop-sheet-' + workerIdRef.current}
                    entry={code ? 'Test' : 'Dummy'}
                    code={code ? code : 'class Dummy { constructor() {} onMount() {} render() { return "" } }'}
                    index={1}
                    room={roomRef.current}
                    onCancel={() => {
                        setCode(undefined)
                        Actions.switchAppletShown(false)
                    }}
                />
                {
                    !code ? (
                        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                            <div style={{ width: 'auto', height: 'auto', position: 'relative', padding: 32, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <Card style={{ width: 56, height: 56, borderRadius: '50%', position: 'absolute', left: '50%', transform: 'translateX(-50%)', backgroundColor: appTheme === "light" ? '#fff' : '#213037' }}>
                                    <Spinner style={{ width: '80%', height: '80%', margin: '10%' }} />
                                </Card>
                                <div style={{ width: 56, height: 56 }} />
                                <Typography variant="body1" style={{ width: 250, textAlign: 'center', marginTop: 12, color: appTheme === "light" ? '#333' : '#fff' }}>
                                    Connecting to Applet...
                                </Typography>
                                <Button
                                    style={{ marginTop: 32 }}
                                    onClick={() => {
                                        setCode(undefined)
                                        Actions.switchAppletShown(false)
                                    }}
                                >
                                    <Icon name='close' className='mr-3' />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : null
                }
            </SwipeableDrawer>
        </React.Fragment>
    );
}

export { AppletSheet, openAppletSheet, closeAppletSheet, notifyAppletSheetReady, appletsheetOpen }
