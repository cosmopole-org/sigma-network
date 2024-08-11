
import {
    CircularProgress,
    IconButton,
    Paper,
    Typography
} from "@mui/material";
import {
    Done,
    DoneAll, History, Pause, PlayArrow
} from "@mui/icons-material";
import './bubble.css'
import { themeColor } from "../../../../App";
import IMessage from "../../../../api/models/message";
import Image from "../../../custom/components/Image";
import IRoom from "../../../../api/models/room";
import Waveform from "../../../custom/components/AudioWave/Waveform";
import { useHookstate } from "@hookstate/core";
import { api } from "../../../..";
import { isLoading, isPlaying, playAudio, registerAudioPlayListener, togglePlay, unregisterAudioPlayListener } from "../../../pages/audioPlayer";
import { useEffect, useState } from "react";

const AudioMessage = (props: { otherDocIds: Array<string | undefined>, room: IRoom, message: IMessage, side?: string, lastOfSection?: boolean, firstOfSection?: boolean, isQuote?: boolean }) => {
    const progress = useHookstate(api.services.file.transferProgress)?.get({ noproxy: true })[props.message.meta?.tag]
    const [, setTrigger] = useState(Math.random())
    useEffect(() => {
        if (props.message.data.docId) {
            registerAudioPlayListener(props.message.data.docId, () => setTrigger(Math.random()));
        }
        return () => {
            if (props.message.data.docId) {
                unregisterAudioPlayListener(props.message.data.docId);
            }
        }
    }, [props.message.data.docId]);
    return (
        <Paper
            className={props.isQuote ? '' : (props.side === 'right' ? "bubble" : "bubble2") + (props.lastOfSection ? (" " + props.side) : "")}
            style={{
                height: props.isQuote ? '100%' : 'calc(100% - 12px)',
                width: 200,
                minWidth: 200,
                borderRadius: props.isQuote ? 0 :
                    props.side === 'left' ?
                        `${props.firstOfSection ? 24 : 8}px 24px 24px 8px` :
                        `24px ${props.firstOfSection ? 24 : 8}px 8px 24px`,
                background: (props.side === 'right' || props.isQuote) ?
                    `linear-gradient(135deg, ${themeColor.get({ noproxy: true })[500]}, ${themeColor.get({ noproxy: true })[200]}) border-box` :
                    themeColor.get({ noproxy: true })['plain'],
                marginLeft: props.side === 'left' ? 0 : 'auto',
                marginRight: props.side === 'left' ? 'auto' : 0,
                position: 'relative',
                padding: 4,
                marginTop: 0,
                marginBottom: 'auto'
            }}
            elevation={0}
        >
            <div style={{ width: 'auto', height: '100%', position: 'relative' }}>
                <div style={{ width: 52, height: '100%', position: 'relative' }}>
                    {
                        props.message.isDummy ?
                            progress === 100 ? (
                                <Paper
                                    style={{
                                        width: 40,
                                        height: 40,
                                        position: 'absolute',
                                        left: 6,
                                        bottom: 6,
                                        borderRadius: '50%',
                                        backgroundColor: themeColor.get({ noproxy: true })[100]
                                    }}>
                                    <CircularProgress
                                        variant={"indeterminate"}
                                        style={{
                                            height: 36,
                                            width: 36,
                                            borderRadius: '8px 8px 8px 24px',
                                            margin: 2
                                        }} />
                                </Paper>
                            ) : (
                                <Paper
                                    elevation={0}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        position: 'absolute',
                                        left: 6,
                                        bottom: 6,
                                        borderRadius: '50%',
                                        backgroundColor: themeColor.get({ noproxy: true })[100]
                                    }}>
                                    <CircularProgress
                                        value={progress}
                                        variant={"determinate"}
                                        style={{
                                            height: 36,
                                            width: 36,
                                            borderRadius: '8px 8px 8px 24px',
                                            margin: 2
                                        }}
                                    />
                                </Paper>
                            ) : props.message.data.docId ? (
                                <div
                                    style={{
                                        borderRadius: '8px 8px 8px 24px',
                                        width: 48,
                                        height: 48,
                                        position: 'absolute',
                                        left: 2,
                                        bottom: 2
                                    }}
                                    onClick={e => {
                                        e.stopPropagation()
                                    }}
                                >
                                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                        <Image
                                            style={{
                                                height: 48,
                                                width: 48,
                                                borderRadius: '8px 8px 8px 24px'
                                            }}
                                            docId={props.message.data.docId}
                                            room={props.room}
                                            tag={`${props.room.id}-${props.message.id}`}
                                            isPreview
                                            key={`message-doc-cover-${props.message.id}`}
                                        />
                                        {
                                            isLoading(props.message.data.docId) ? (
                                                <CircularProgress
                                                    variant="indeterminate"
                                                    style={{
                                                        position: 'absolute',
                                                        width: '100%',
                                                        height: '100%',
                                                        left: 0,
                                                        top: 0
                                                    }} />
                                            ) : null
                                        }
                                        <div
                                            style={{
                                                height: 48,
                                                width: 48,
                                                borderRadius: '8px 8px 8px 24px',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                backgroundColor: 'rgba(0, 0, 0, 0.25)'
                                            }}
                                        />
                                        <IconButton
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0
                                            }}
                                            onClick={() => {
                                                if (props.message.data.docId) {
                                                    if (isPlaying(props.message.data.docId)) {
                                                        togglePlay(false)
                                                    } else {
                                                        playAudio(props.message.data.docId, props.room, props.otherDocIds);
                                                    }
                                                }
                                            }}
                                        >
                                            {isPlaying(props.message.data.docId) ? <Pause style={{ fill: '#fff' }} /> : <PlayArrow style={{ fill: '#fff' }} />}
                                        </IconButton>
                                    </div>
                                </div>
                            ) : null
                    }
                </div>
                {
                    (props.message.data.docId && !props.message.isDummy) ? (
                        <Waveform
                            style={{ width: 128, position: 'absolute', left: 60, top: 8, height: 56 }}
                            docId={props.message.data.docId}
                            tag={`${props.room.id}-${props.message.id}-waveform`}
                            room={props.room}
                            isPreview={true}
                        />
                    ) : (
                        <div
                            style={{
                                width: 120, height: 0, position: 'absolute', left: 60, top: 40,
                                borderStyle: 'dashed', borderColor: themeColor.get({ noproxy: true })[100], borderWidth: 4
                            }}
                        />
                    )
                }
                <Typography
                    variant={"caption"}
                    style={{
                        borderRadius: props.isQuote ? 0 :
                            props.side === 'left' ?
                                `${props.firstOfSection ? 24 : 8}px 24px 24px 8px` :
                                `8px ${props.firstOfSection ? 24 : 24}px 8px 24px`,
                        paddingLeft: 8, paddingRight: 8,
                        textAlign: "left", fontWeight: 'bold', height: 'auto', position: 'absolute', left: 0, top: 0,
                        color: props.side === 'left' ? themeColor.get({ noproxy: true })['activeText'] : '#fff'
                    }}
                >
                    {(props.message as any).author.firstName}
                </Typography>
                {
                    props.isQuote ?
                        null :
                        (
                            <div style={{
                                width: 'auto', position: 'absolute', bottom: 0, right: 0, display: "flex",
                                paddingLeft: 8, paddingRight: 8, paddingBottom: 2, paddingTop: 4,
                                borderRadius: props.isQuote ? 0 :
                                    props.side === 'left' ?
                                        `${props.firstOfSection ? 24 : 8}px 24px 24px 8px` :
                                        `24px 8px 8px 8px`,
                            }}>
                                <Typography
                                    style={{ textAlign: "right", flex: 1, fontSize: 12, color: props.side === 'left' ? themeColor.get({ noproxy: true })['activeText'] : '#fff' }}
                                >
                                    {(new Date(props.message.time)).toTimeString().substring(0, 5)}
                                </Typography>
                                {
                                    (props.message as any).isDummy ? (
                                        <History
                                            style={{
                                                width: 16,
                                                height: 16,
                                                marginLeft: 2,
                                                fill: props.side === 'left' ? themeColor.get({ noproxy: true })['activeText'] : '#fff'
                                            }}
                                        />
                                    ) : props.message.authorId !== api.memory.myHumanId.get({ noproxy: true }) ?
                                        null :
                                        props.message.seen ? (
                                            <DoneAll
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    marginLeft: 2,
                                                    fill: props.side === 'left' ? themeColor.get({ noproxy: true })['activeText'] : '#fff'
                                                }}
                                            />
                                        ) : (
                                            <Done
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    marginLeft: 2,
                                                    fill: props.side === 'left' ? themeColor.get({ noproxy: true })['activeText'] : '#fff'
                                                }}
                                            />
                                        )
                                }
                            </div>
                        )
                }
            </div>
        </Paper >
    );
}

export default AudioMessage;
