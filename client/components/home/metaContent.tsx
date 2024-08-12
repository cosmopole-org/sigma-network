import { useRef } from "react";
import { hookstate, useHookstate } from "@hookstate/core";
import { Card } from "@nextui-org/react";
import Chat from "../room/room-chat";
import RoomWallpaper from '../../images/room.jpg';

export const metaActiveTab = hookstate('chat')

const MetaContent = (props: { room: any, needToCloseRecorder?: boolean }) => {
    return (
        <Card className="overflow-hidden w-full h-full bg-white">
            <div
                style={{
                    height: 'calc(100% - 48px)'
                }}
            >
                <div style={{
                    position: 'relative', width: '100%', height: '100%', zIndex: 2
                }}>
                    <img src={RoomWallpaper.src} className="w-full h-full left-0 top-0 absolute"/>
                    <div style={{ width: '100%', height: `100%` }}>
                        <Chat />
                    </div>
                    <div
                        style={{
                            width: '100%', height: 'auto', position: 'absolute', left: 0, top: 0, backgroundColor: '#fff',
                            borderRadius: '24px 24px 0px 0px'
                        }}
                    >
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default MetaContent
