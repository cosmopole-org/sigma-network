import * as React from 'react';
import { Card, CircularProgress, Fab, IconButton, Paper, SwipeableDrawer, Typography, createTheme } from '@mui/material';
import AppletHost from './applet-host';
import { useHookstate } from '@hookstate/core';
import useSafezone from './useSafezone';
import { Close, OpenInFull } from '@mui/icons-material';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { Topic } from '@/api/sigma/models';
import { Button } from '@nextui-org/button';
import { colors } from '@nextui-org/theme';
import { api } from '@/index';

let openAppletSheet = (room: Topic, workerId: string) => { }
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
    const [shown, setShown]: [boolean, any] = React.useState(false)
    const workerIdRef: any = React.useRef(undefined)
    const roomRef: any = React.useRef(undefined)
    const safezoneRepo = useSafezone()
    const safezoneRef: any = React.useRef(undefined)
    const readyState = useHookstate(safezoneRef.current?.ready)
    const ready = readyState?.get({ noproxy: true })
    React.useEffect(() => {
        let getAppletEvent = api.sigma.services?.topics.onPacketReceive((packet: any) => {
            let data = packet.data;
            if (data.tag === 'get/applet') {
                if (packet.member.id === workerIdRef.current) {
                    setCode(data.code)
                }
            }
        })
        return () => {
            getAppletEvent?.remove()
        }
    }, [])
    closeAppletSheet = () => setShown(false)
    openAppletSheet = (room: Topic, workerId: string) => {
        workerIdRef.current = workerId
        roomRef.current = room
        safezoneRef.current = safezoneRepo.accessSafeZoneController().findById(workerId)
        setShown(true)
        api.sigma.store.db.collections.members.findOne({ selector: { userId: { $eq: api.sigma.store.myUserId }, spaceId: { $eq: room.spaceId } } }).exec().then((member: any) => {
            api.sigma.services?.topics.send({ type: "single", spaceId: room.spaceId, topicId: room.id, memberId: member.id, recvId: workerId, data: { tag: 'get/applet', secondaryColor: colors.purple, colorName: "blue", colors: colors.blue } })
        });
    }
    const [full, setFull] = React.useState(false)
    appletsheetOpen = shown
    return (
        <React.Fragment>
            <SwipeableDrawer anchor='bottom' open={shown} onOpen={() => { }} onClose={() => {
                readyState.set(false)
                setCode(undefined)
                setShown(false)
            }}
                disableSwipeToOpen

                SlideProps={{
                    onEntering: (node, isAppearing) => {
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
                        backgroundColor: colors.blue[50],
                        overflowY: 'auto'
                    }
                }}
            >
                <div style={{ width: '100%', position: 'relative', height: 32 }}>
                    {full ? null : <Card style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 100, height: 6, borderRadius: 3, background: colors.blue[100], top: 12 }} />}
                    <IconButton
                        style={{ backgroundColor: colors.blue[200], position: 'absolute', right: 4, top: 4 }}
                        onClick={() => setFull(!full)}
                    >
                        {
                            full ? (
                                <CloseFullscreenIcon style={{ width: 16, height: 16 }} />
                            ) : (
                                <OpenInFull style={{ width: 16, height: 16 }} />
                            )
                        }
                    </IconButton>
                </div>
                <AppletHost.Host
                    appletKey={'desktop-sheet-' + workerIdRef.current}
                    entry={code ? 'Test' : 'Dummy'}
                    code={code ? code : 'class Dummy { constructor() {} onMount() {} render() { return "" } }'}
                    index={1}
                    room={roomRef.current}
                    onCancel={() => {
                        setCode(undefined)
                        setShown(false)
                    }}
                />
                {
                    !code ? (
                        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                            <div style={{ width: 'auto', height: 'auto', position: 'relative', padding: 32, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <Paper style={{ width: 56, height: 56, borderRadius: '50%', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                                    <CircularProgress style={{ width: '80%', height: '80%', margin: '10%' }} variant="indeterminate" />
                                </Paper>
                                <div style={{ width: 56, height: 56 }} />
                                <Typography variant="body1" style={{ width: 250, textAlign: 'center', marginTop: 12 }}>
                                    Connecting to Applet...
                                </Typography>
                                <Button
                                    style={{ marginTop: 32 }}
                                    onClick={() => {
                                        setCode(undefined)
                                        setShown(false)
                                    }}
                                >
                                    <Close style={{ marginRight: 12 }} />
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
