"use client"

import RoomNavbar from "@/components/room/room-navbar";
import { useRef } from "react";

export default function RoomSettings() {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
        <div ref={containerRef} className="w-full h-full relative">
            <div className="fixed top-0 left-0 overflow-hidden w-full h-full">
                <div className="relative m-auto">
                    Settings is pending...
                </div>
            </div>
            <RoomNavbar />
        </div>
    );
}
