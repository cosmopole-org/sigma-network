"use client"

import BoardEl from "@/components/room/room-board";
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
                            'https://i.pinimg.com/564x/95/65/ac/9565acb26c627decd036b2118fdb68f3.jpg' :
                            'https://i.pinimg.com/564x/88/f5/46/88f546fea513dc0e73bccefe3ac92eef.jpg'}
                        className="object-cover w-full h-full absolute left-0 top-0"
                    />
                </div>
            </div>
            <RoomNavbar />
            <BoardEl
                changeScrollLock={(v: boolean) => {
                    if (containerRef.current) {
                        containerRef.current.style.overflow = v ? 'hidden' : '';
                    }
                }}
                getSCrollY={() => {
                    return (containerRef.current?.scrollTop ?? 0) + 196;
                }} />
        </div>
    );
}
