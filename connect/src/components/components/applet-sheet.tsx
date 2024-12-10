import * as React from 'react';
import AppletHost from './applet-host';
import { Topic } from '@/api/sigma/models';
import { Button, Drawer, DrawerBody, DrawerContent } from '@nextui-org/react';
import { colors } from '@nextui-org/theme';
import { api } from '@/index';
import { Actions, States, useTheme } from '@/api/client/states';
import { Card, Spinner } from '@nextui-org/react';
import Icon from '../elements/icon';

let openAppletSheet = (_room: Topic, _workerId: string) => { }
let closeAppletSheet = () => { }
let notifyAppletSheetReady = () => { }
let appletsheetOpen = false

const AppletSheet = () => {
    const [code, setCode]: [any, any] = React.useState(undefined)
    const { theme: appTheme } = useTheme();
    const workerIdRef: any = React.useRef(undefined)
    const roomRef: any = React.useRef(undefined)
    const appletShown = States.useListener(States.store.appletShown);
    React.useEffect(() => {
        if (!appletShown) {
            setCode(undefined);
        }
    }, [appletShown]);
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
    const full = States.useListener(States.store.appletFull);
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
        if (appletShown) {
            setOpen(true);
        } else {
            setTimeout(() => setOpen(false), 250);
        }
    }, [appletShown]);
    appletsheetOpen = appletShown;
    const h = full ? window.innerHeight : (window.innerHeight * 8 / 10);
    return open ? (
        <div style={{ zIndex: 99998 }} onClick={() => {
            Actions.switchAppletLoaded(false)
            Actions.switchAppletShown(false)
        }} className='w-full h-full absolute left-0 top-0'>
            <Drawer
                isDismissable={false}
                classNames={{
                    base: "data-[placement=bottom]:sm:m-2 data-[placement=left]:sm:m-2",
                }}
                radius={full ? 'none' : "lg"}
                backdrop="blur"
                size={'4xl'}
                placement='bottom'
                isOpen={appletShown}
                hideCloseButton
                onOpenChange={(v) => {
                    if (!v) {
                        Actions.switchAppletLoaded(false)
                        Actions.switchAppletShown(false)
                    }
                }}
            >
                <DrawerContent onClick={e => {
                    e.stopPropagation();
                }} style={{ paddingTop: full ? 32 : 0, minHeight: h, height: h, transition: 'min-height 250ms, height 250ms' }}>
                    {() => (
                        <>
                            <div style={{ width: '100%', position: 'relative', height: 28 }}>
                                {full ? null : <Card style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 100, height: 6, borderRadius: 3, top: 12 }} className='bg-primary' />}
                            </div>
                            <DrawerBody className='p-0 w-full relative' style={{ minHeight: (window.innerHeight * 8 / 10) - 40 }}>
                                <AppletHost.Host
                                    full={full}
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
                                                <p style={{ width: 250, textAlign: 'center', marginTop: 12, color: appTheme === "light" ? '#333' : '#fff' }}>
                                                    Connecting to Applet...
                                                </p>
                                                <Button
                                                    style={{ marginTop: 28 }}
                                                    onPress={() => {
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
                            </DrawerBody>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    ) : null;
}

export { AppletSheet, openAppletSheet, closeAppletSheet, notifyAppletSheetReady, appletsheetOpen }
