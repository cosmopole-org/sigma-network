"use client"

import { switchRoomLoading } from "@/api/offline/states";
import Chat from "@/components/room/room-chat";
import { useEffect, useRef } from "react";

export default function Board() {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => switchRoomLoading(false), []);
    return (
        <div ref={containerRef} className="w-full h-full relative">
            <Chat />
        </div>
    );
}
