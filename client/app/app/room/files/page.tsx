"use client"

import { switchRoomLoading } from "@/api/offline/states";
import FilesEl from "@/components/room/room-files";
import { useEffect, useRef } from "react";

export default function Files() {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => switchRoomLoading(false), []);
    return (
        <div ref={containerRef} className="w-full h-full relative overflow-y-auto">
            <FilesEl />
        </div>
    );
}
