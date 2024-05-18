"use client"

import Chat from "@/components/room/room-chat";
import { useRef } from "react";

export default function Board() {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
        <div ref={containerRef} className="w-full h-full relative">
            <Chat />
        </div>
    );
}
