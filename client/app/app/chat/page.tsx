"use client"

import React from "react";
import Chat from '@/components/room/room-chat';
import RoomWallpaper from '../../../images/room.jpg';

export default function ChatPage() {
    return (
        <div className="w-full h-full relative">
            <img src={RoomWallpaper.src} className="w-full h-full left-0 top-0 absolute" />
            <div key={'room-background-overlay'} style={{
                opacity: 0.65,
                width: '100%', height: '100%', position: 'absolute', left: 0, top: 0
            }}
                className="bg-primary/50"
            />
            <Chat />
        </div>
    )
}
