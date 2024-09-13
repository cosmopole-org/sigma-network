"use client"

import React from "react";
import { Card } from "@nextui-org/react";
import { BottomNavItem } from "../elements/bottomnav-item";
import { useTheme } from "@/api/client/states";
import { RouteSys, switchRoomLoading } from "@/api/client/states";

export default function RoomBottomNav({ openPanel, panelKey }: Readonly<{ openPanel: (panelKey: string) => void, panelKey: string | undefined }>) {
    const { theme } = useTheme();
    const openCall = () => () => {
        RouteSys.push("/app/call")
    }
    const openPanelByKey = (key: string) => () => {
        switchRoomLoading(true);
        openPanel(key);
    }
    return (
        <Card isBlurred={false} className={`grid grid-cols-4 fixed ${panelKey ? "left-0" : "left-2/4 -translate-x-2/4"} ${panelKey ? "bottom-0" : "bottom-3"} h-[56px] pt-[6px] ${panelKey ? "w-full" : "w-[250px]"}` + (panelKey ? " -translate-y-[calc(100vh-168px)]" : " -translate-y-[0px]")} style={{ backdropFilter: 'blur(10px)', background: theme === 'light' ? 'rgba(41, 98, 255, 0.8)' : '#7828C8aa', borderRadius: panelKey ? "32px 32px 0px 0px" : 32, zIndex: 1000, transition: "transform 250ms" }}>
            <BottomNavItem color="#fff" iconOnly itemKey="call" selected={panelKey} title="Call" icon="call" onClick={openCall()} />
            <BottomNavItem color="#fff" iconOnly itemKey="chat" selected={panelKey} title="Chat" icon="chat" onClick={openPanelByKey('chat')} />
            <BottomNavItem color="#fff" iconOnly itemKey="files" selected={panelKey} title="Files" icon="storage" onClick={openPanelByKey('files')} />
            <BottomNavItem color="#fff" iconOnly pt={2} pb={3} iconSize={19} itemKey="settings" selected={panelKey} title="Settings" icon="settings" onClick={openPanelByKey('settings')} />
        </Card >
    )
}
