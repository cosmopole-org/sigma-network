"use client"

import FilesEl from "@/components/room/room-files";
import { useRef } from "react";

export default function Files() {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
        <div ref={containerRef} className="w-full h-full relative overflow-y-auto">
            <FilesEl />
        </div>
    );
}
