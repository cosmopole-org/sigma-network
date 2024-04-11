"use client"

import { Card } from "@nextui-org/react";
import { BottomNavItem } from "../elements/bottomnav-item";
import { hookstate, useHookstate } from "@hookstate/core";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { switchRoomLoading } from "@/api/offline/states";
import { useEffect } from "react";

export const selectedRoomSection = hookstate("board");
export const switchRoomSection = (s: string) => {
    selectedRoomSection.set(s);
}

export default function RoomBottomNav() {
    const { theme } = useTheme();
    const router = useRouter();
    const path = usePathname();
    const selectedState = useHookstate(selectedRoomSection);
    useEffect(() => {
        let pArr = path.split('/')
        switchRoomSection(pArr[pArr.length - 1]);
    }, []);
    const onItemClick = (key: string) => () => {
        selectedState.set(key);
        switchRoomLoading(true);
        router.replace('/app/room/' + key);
    }
    return (
        <Card isBlurred className="grid grid-cols-4 fixed bottom-0 left-0 w-full h-[72px] pt-1" style={{ borderRadius: '24px 24px 0px 0px', zIndex: 1000, backgroundColor: theme === 'light' ? "#ffffffaf" : "#172024af" }}>
            <BottomNavItem itemKey="board" selected={selectedState.get({ noproxy: true })} title="Board" icon="board" onClick={onItemClick('board')} />
            <BottomNavItem itemKey="chat" selected={selectedState.get({ noproxy: true })} title="Chat" icon="chat" onClick={onItemClick('chat')} />
            <BottomNavItem itemKey="files" selected={selectedState.get({ noproxy: true })} title="Files" icon="storage" onClick={onItemClick('files')} />
            <BottomNavItem pt={2} pb={3} iconSize={19} itemKey="settings" selected={selectedState.get({ noproxy: true })} title="Settings" icon="settings" onClick={onItemClick('settings')} />
        </Card >
    )
}
