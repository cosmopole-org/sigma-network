
import {
    Badge,
    Fade,
} from "@mui/material";
import SigmaAvatar from "../../../custom/elements/SigmaAvatar";
import { useHookstate } from "@hookstate/core";
import { api } from "../../../..";
import { SigmaRouter } from "../../../../App";

const MessageRow = (props: { message: any, side: string, children: any, lastOfSection?: boolean, firstOfSection?: boolean }) => {
    const isOnline = useHookstate(api.services.home.lastSeensDict).get({ noproxy: true })[props.message.authorId]
    return (
        <Fade in={true}>
            <div
                style={{
                    height: `calc(100% - ${props.message.meta?.value2 ? props.message.meta.value2 : 0}px)`,
                    width: 'auto',
                    maxWidth: props.side === 'left' ? 300 : 250,
                    position: "relative",
                    marginLeft: props.side === 'left' ? 8 : 'auto',
                    marginRight: props.side === 'left' ? 'auto' : props.lastOfSection ? 0 : 6,
                    display: 'flex',
                    alignContent: 'flex-start'
                }}
            >
                {
                    (props.side === 'left' && props.lastOfSection) ? (
                        <Badge color="secondary" overlap="circular" variant="dot" invisible={isOnline !== -1} style={{ marginTop: 'auto', marginBottom: 0 }}>
                            <SigmaAvatar style={{ marginRight: -4, width: 32, height: 32 }}
                                onClick={(e: any) => {
                                    e.stopPropagation()
                                    SigmaRouter.navigate('profile', { initialData: { human: props.message.author } })
                                }}
                            >
                                {props.message.author.firstName.substring(0, 1)}
                            </SigmaAvatar>
                        </Badge>

                    ) : (
                        <div style={{ marginTop: 'auto', marginBottom: 0, width: 42, height: 42 }}>

                        </div>
                    )
                }
                {props.children}
                {
                    (props.side === 'right') ? (
                        <div style={{
                            marginTop: 'auto', marginBottom: 0, minWidth: props.lastOfSection ? 0 : 8,
                            width: props.lastOfSection ? 0 : 8, height: 16
                        }}>

                        </div>
                    ) : null
                }
            </div>
        </Fade>
    );
}

export default MessageRow;
