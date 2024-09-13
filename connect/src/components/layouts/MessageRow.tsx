import { RouteSys } from "@/api/client/states";
import { Avatar, Badge } from "@nextui-org/react";

const MessageRow = (props: { message: any, side: string, children: any, lastOfSection?: boolean, firstOfSection?: boolean }) => {
    let ml: any;
    if (props.side === "left") {
        ml = 'auto';
    } else if (props.lastOfSection) {
        ml = 0;
    } else {
        ml = 0;
    }
    return (
        <div
            style={{
                height: `calc(100% - ${props.message.meta?.value2 ? props.message.meta.value2 : 0}px)`,
                width: 'auto',
                maxWidth: props.side === 'left' ? 300 : 250,
                position: "relative",
                marginLeft: props.side === 'left' ? 8 : 'auto',
                marginRight: ml,
                display: 'flex',
                alignContent: 'flex-start'
            }}
        >
            {
                (props.side === 'left' && props.lastOfSection) ? (
                    <Badge color="secondary" shape="circle" variant="solid" isInvisible={false} style={{ marginTop: 'auto', marginBottom: 0 }}>
                        <Avatar style={{ marginRight: -4, width: 32, height: 32 }}
                            onClick={(e: any) => {
                                e.stopPropagation()
                                RouteSys.push('/app/profile', { initialData: { user: props.message.author } })
                            }}
                        >
                            {props.message.author?.firstName.substring(0, 1)}
                        </Avatar>
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
                        marginTop: 'auto', marginBottom: 0, minWidth: props.lastOfSection ? 0 : 0,
                        width: props.lastOfSection ? 0 : 0, height: 16
                    }}>

                    </div>
                ) : null
            }
        </div>
    );
}

export default MessageRow;
