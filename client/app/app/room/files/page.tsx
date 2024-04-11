"use client"

import { getWallpapers } from "@/api/offline/constants";
import FilesEl from "@/components/room/room-files";
import RoomNavbar from "@/components/room/room-navbar";
import { useTheme } from "next-themes";
import { useRef } from "react";

export default function Files() {
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    return (
        <div ref={containerRef} className="w-full h-full relative">
            <div className="fixed top-0 left-0 overflow-hidden w-full h-full">
                <div className="relative w-full h-full">
                    <img
                        alt="header"
                        src={theme === 'light' ? getWallpapers().LIGHT : getWallpapers().DARK}
                        className="object-cover w-full h-full absolute left-0 top-0"
                    />
                </div>
            </div>
            <RoomNavbar />
            <FilesEl />
        </div>
    );
}
