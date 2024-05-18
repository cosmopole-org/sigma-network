"use client"

import React from "react";
import { Card } from "@nextui-org/react";
import { BottomNavItem } from "../elements/bottomnav-item";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function RoomBottomNav({ openPanel, panelKey }: Readonly<{ openPanel: (panelKey: string) => void, panelKey: string | undefined }>) {
    const { theme } = useTheme();
    const router = useRouter();
    const openCall = () => () => {
        router.push("/app/call")
    }
    const openPanelByKey = (key: string) => () => {
        openPanel(key);
        router.replace('/app/room/' + key);
    }
    return (
        <Card isBlurred className={`grid grid-cols-4 fixed left-${panelKey ? 0 : 2} bottom-${panelKey ? 0 : 2} w-full h-[72px] pt-1 w-${panelKey ? "full" : "[calc(100%-16px)]"}` + (panelKey ? " -translate-y-[calc(100vh-168px)]" : " -translate-y-[0px]")} style={{ borderRadius: panelKey ? "32px 32px 0px 0px" : 32, zIndex: 1000, backgroundColor: theme === 'light' ? "#ffffffaf" : "#172024af", transition: "transform 250ms" }}>
            <BottomNavItem itemKey="call" selected={panelKey} title="Call" icon="call" onClick={openCall()} />
            <BottomNavItem itemKey="chat" selected={panelKey} title="Chat" icon="chat" onClick={openPanelByKey('chat')} />
            <BottomNavItem itemKey="files" selected={panelKey} title="Files" icon="storage" onClick={openPanelByKey('files')} />
            <BottomNavItem pt={2} pb={3} iconSize={19} itemKey="settings" selected={panelKey} title="Settings" icon="settings" onClick={openPanelByKey('settings')} />
        </Card >
    )
}
