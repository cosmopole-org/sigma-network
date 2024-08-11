
import {
    Paper,
    Typography
} from "@mui/material";
import {
    Done,
    DoneAll, History
} from "@mui/icons-material";
import './bubble.css'
import { themeColor } from "../../../../App";
import IMessage from "../../../../api/models/message";
import { api } from "../../../..";

const TextMessage = (props: { message: IMessage, side?: string, lastOfSection?: boolean, firstOfSection?: boolean, isQuote?: boolean }) => {
    return (
        <Paper
            style={{
                height: props.isQuote ? '100%' : 'calc(100% - 20px)',
                width: 'auto',
                minWidth: 100,
                borderRadius: props.isQuote ? 0 :
                    props.side === 'left' ?
                        `${props.firstOfSection ? 24 : 8}px 24px 24px 8px` :
                        `24px ${props.firstOfSection ? 24 : 8}px 8px 24px`,
                padding: 8,
                paddingTop: props.isQuote ? 0 : 8,
                background: props.isQuote ?
                    themeColor.get({ noproxy: true })[200] :
                    (props.side === 'right' || props.isQuote) ?
                        `linear-gradient(135deg, ${themeColor.get({ noproxy: true })[500]}, ${themeColor.get({ noproxy: true })[200]}) border-box` :
                        themeColor.get({ noproxy: true })['plain'],
                marginLeft: props.side === 'left' ? 0 : 'auto',
                marginRight: props.side === 'left' ? 'auto' : 0,
                marginTop: 0,
                marginBottom: 'auto'
            }}
            elevation={0}
            className={props.isQuote ? '' : (props.side === 'right' ? "bubble" : "bubble2") + (props.lastOfSection ? (" " + props.side) : "")}
        >
            <div style={{ width: 'auto', height: '100%', position: 'relative' }}>
                <Typography
                    variant={"caption"}
                    style={{
                        textAlign: "left", fontWeight: 'bold', borderRadius: 8, marginTop: 0, height: 'auto',
                        background: 'transparent', color: props.side === 'left' ? themeColor.get({ noproxy: true })['activeText'] : '#fff'
                    }}
                >
                    {(props.message as any).author.firstName}
                </Typography>
                <Typography
                    style={{
                        textAlign: "left", wordWrap: 'break-word', textOverflow: props.isQuote ? 'ellipsis' : undefined,
                        whiteSpace: props.isQuote ? 'nowrap' : undefined, overflow: props.isQuote ? 'hidden' : undefined,
                        display: 'flex', wordBreak: 'break-word', fontSize: 14, height: 'auto', paddingBottom: 16,
                        color: props.side === 'left' ? themeColor.get({ noproxy: true })['activeText'] : '#fff'
                    }}
                >
                    {props.message.data.text}
                </Typography>
                {
                    props.isQuote ?
                        null :
                        (
                            <div style={{
                                width: 'auto', position: 'absolute', bottom: 0, right: 0, display: "flex",
                                paddingLeft: 0, paddingRight: 0,
                                borderRadius: "16px 16px 0px 16px"
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
        </Paper>
    );
}

export default TextMessage;
