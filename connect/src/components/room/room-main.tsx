"use client"

import BoardEl from "@/components/room/room-board";
import RoomNavbar, { roomNavShow, switchRoomNav } from "@/components/room/room-navbar";
import { useTheme } from "@/api/client/states";
import { useEffect, useRef } from "react";

export default function Main() {
    const scrollValRef = useRef(0);
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const scrollTracker = () => {
            if (containerRef.current) {
                let currentScroll = containerRef.current.scrollTop;
                if ((currentScroll > scrollValRef.current) && roomNavShow.get({ noproxy: true })) {
                    switchRoomNav(false);
                } else if ((currentScroll < scrollValRef.current) && !roomNavShow.get({ noproxy: true })) {
                    switchRoomNav(true);
                }
                scrollValRef.current = currentScroll;
            }
        };
        containerRef.current?.addEventListener('scroll', scrollTracker);
        return () => {
            containerRef.current?.removeEventListener('scroll', scrollTracker);
        }
    }, [])
    return (
        <div ref={containerRef} className="w-full h-full relative overflow-x-hidden overflow-y-auto">
            <RoomNavbar />
            <BoardEl
                highlightColor={theme === 'light' ? '#006FEE' : '#7828C8'}
                changeScrollLock={(v: boolean) => {
                    if (containerRef.current) {
                        containerRef.current.style.overflow = v ? 'hidden' : '';
                    }
                }}
                getSCrollY={() => {
                    return (containerRef.current?.scrollTop ?? 0) + 72;
                }} />
        </div>
    );
}
