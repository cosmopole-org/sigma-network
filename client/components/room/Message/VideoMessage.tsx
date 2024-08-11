
import {
    CircularProgress,
    Paper,
    Typography
} from "@mui/material";
import {
    Done,
    DoneAll, History, PlayArrow
} from "@mui/icons-material";
import './bubble.css'
import { SigmaRouter, themeColor } from "../../../../App";
import IMessage from "../../../../api/models/message";
import Image from "../../../custom/components/Image";
import IRoom from "../../../../api/models/room";
import SigmaFab from "../../../custom/elements/SigmaFab";
import { api } from "../../../..";
import { useHookstate } from "@hookstate/core";

const VideoMessage = (props: { room: IRoom, message: IMessage, side?: string, lastOfSection?: boolean, firstOfSection?: boolean, isQuote?: boolean }) => {
    let progress = useHookstate(api.services.file.transferProgress)?.get({ noproxy: true })[props.message.meta?.tag]
    return (
        <Paper
            style={{
                height: props.isQuote ? '100%' : 'calc(100% - 12px)',
                width: 220,
                minWidth: 220,
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
                padding: 2,
                marginTop: 0,
                marginBottom: 'auto'
            }}
            elevation={0}
            className={props.isQuote ? '' : (props.side === 'right' ? "bubble" : "bubble2") + (props.lastOfSection ? (" " + props.side) : "")}
        >
            <div style={{ width: 'auto', height: '100%', position: 'relative' }}>
                {
                    props.message.data.docId ? (
                        <Image
                            local={props.message.isDummy ? props.message.meta.local : undefined}
                            style={{
                                height: '100%',
                                width: '100%',
                                borderRadius: props.isQuote ? 0 :
                                    props.side === 'left' ?
                                        `${props.firstOfSection ? 24 : 8}px 24px 24px 8px` :
                                        `24px ${props.firstOfSection ? 24 : 8}px 8px 24px`,
                                position: 'absolute',
                                left: 0,
                                top: 0
                            }}
                            docId={props.message.data.docId}
                            room={props.room}
                            tag={`${props.room.id}-${props.message.id}`}
                            isPreview
                            key={`message-doc-photo-${props.message.id}`}
                        />
                    ) : null
                }
                {
                    props.message.isDummy ?
                        progress === 100 ? (
                            <CircularProgress value={progress} variant={"indeterminate"} style={{ width: 48, height: 48, position: 'absolute', left: 'calc(50% - 24px)', top: 'calc(50% - 24px)', transform: 'translate(-50%, -50%)' }} />
                        ) : (
                            <CircularProgress value={progress} variant={"determinate"} style={{ width: 48, height: 48, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
                        ) : (
                            <SigmaFab size={'large'} onClick={(e: any) => {
                                e.stopPropagation()
                                SigmaRouter.navigate('videoPlayer', { initialData: { docId: props.message.data.docId, room: props.room } })
                            }} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                                <PlayArrow />
                            </SigmaFab>
                        )
                }
                <Typography
                    variant={"caption"}
                    style={{
                        borderRadius: props.isQuote ? 0 :
                            props.side === 'left' ?
                                `${props.firstOfSection ? 24 : 8}px 24px 24px 8px` :
                                `24px ${props.firstOfSection ? 24 : 8}px 8px 8px`,
                        paddingLeft: 8, paddingRight: 8, paddingBottom: 2, paddingTop: 8,
                        textAlign: "left", fontWeight: 'bold', marginTop: 0, height: 'auto', position: 'absolute', left: 4, top: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#fff'
                    }}
                >
                    {(props.message as any).author.firstName}
                </Typography>
                {
                    props.isQuote ?
                        null :
                        (
                            <div style={{
                                width: 'auto', position: 'absolute', bottom: 4, right: 4, display: "flex",
                                paddingLeft: 8, paddingRight: 8, paddingBottom: 2, paddingTop: 4,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: props.isQuote ? 0 :
                                    props.side === 'left' ?
                                        `24px 24px 24px 8px` :
                                        `24px ${props.firstOfSection ? 24 : 8}px 8px 8px`,
                            }}>
                                <Typography
                                    style={{ textAlign: "right", flex: 1, fontSize: 12, color: '#fff' }}
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
                                                fill: '#fff'
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
                                                    fill: '#fff'
                                                }}
                                            />
                                        ) : (
                                            <Done
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    marginLeft: 2,
                                                    fill: '#fff'
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

export default VideoMessage;
