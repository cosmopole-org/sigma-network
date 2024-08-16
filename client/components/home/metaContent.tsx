import React from "react";
import { hookstate } from "@hookstate/core";
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
                    position: 'relative', width: '100%', height: '100%'
                }}>
                    <img src={RoomWallpaper.src} className="w-full h-full left-0 top-0 absolute" />
                    <div key={'room-background-overlay'} style={{
                        opacity: 0.65,
                        width: '100%', height: '100%', position: 'absolute', left: 0, top: 0
                    }}
                    className="bg-primary/50"
                    />
                    <div
                        style={{
                            width: '100%', height: 32,
                            borderRadius: '12px 12px 0px 0px', position: 'relative'
                        }}
                        className="bg-content1"
                    >
                        <div className="w-32 h-[4px] bg-primary ml-auto mr-auto translate-y-4 rounded-xl shadow-medium" />
                    </div>
                    <div style={{ width: '100%', height: `calc(100% - 40px)` }}>
                        <Chat />
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default MetaContent
