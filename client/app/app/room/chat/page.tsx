"use client"

import ChatEl from "@/components/room/room-chat";
import RoomNavbar from "@/components/room/room-navbar";
import { useTheme } from "next-themes";
import { useRef } from "react";

export default function Board() {
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    return (
        <div ref={containerRef} className="w-full h-full relative">
            <div className="fixed top-0 left-0 overflow-hidden w-full h-full">
                <div className="relative w-full h-full">
                    <img
                        alt="header"
                        src={theme === 'light' ?
                            'https://i.pinimg.com/564x/ca/87/e9/ca87e97194cd4c53fcb270db01b6e86d.jpg' :
                            'https://i.pinimg.com/564x/51/93/43/519343f938c61822d039f31fb9ad96c8.jpg'}
                        className="object-cover w-full h-full absolute left-0 top-0"
                    />
                </div>
            </div>
            <RoomNavbar />
            <ChatEl />
        </div>
    );
}
