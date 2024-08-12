"use client"

import { switchRoomLoading } from "@/api/offline/states";
import { useEffect, useRef } from "react";

export default function RoomSettings() {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => switchRoomLoading(false), []);
    return (
        <div ref={containerRef} className="w-full h-full relative overflow-y-auto">
            <div className="fixed top-0 left-0 overflow-hidden w-full h-full">
                <div className="relative m-auto">
                    Settings is pending...
                </div>
            </div>
        </div>
    );
}
