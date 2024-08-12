"use client"

import React, { useEffect, useState } from "react";
import { Card } from "@nextui-org/react";
import { BottomNavItem } from "../elements/bottomnav-item";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { changeMetaDrawerState } from "./metaTouch";
import { showRoomShadow } from "./shadow";
import { useHookstate } from "@hookstate/core";

export default function MainBottomNav() {
    const isSelected = useHookstate(showRoomShadow);
    const router = useRouter();
    const [panelKey, setPanelKey] = useState<string | undefined>(undefined)
    const { theme } = useTheme();
    useEffect(() => {
        if (!isSelected.get({noproxy: true})) {
            setPanelKey(undefined)            
        }
    }, [isSelected.get({ noproxy: true })]);
    const openCall = () => () => {
        router.push("/app/call")
    }
    const openPanelByKey = (key: string) => () => {
        setPanelKey(key)
        changeMetaDrawerState(true);
        showRoomShadow.set(true);
    }
    return (
        <Card
            style={{ backgroundColor: theme === 'light' ? 'rgb(41, 98, 255)' : '#7828C8' }}
            className="grid grid-cols-4 rounded-3xl w-[calc(100%-96px)] ml-12 h-14">
            <BottomNavItem color="#fff" iconOnly itemKey="call" selected={panelKey} title="Call" icon="call" onClick={openCall()} />
            <BottomNavItem color="#fff" iconOnly itemKey="chat" selected={panelKey} title="Chat" icon="chat" onClick={openPanelByKey('chat')} />
            <BottomNavItem color="#fff" iconOnly itemKey="files" selected={panelKey} title="Files" icon="storage" onClick={openPanelByKey('files')} />
            <BottomNavItem color="#fff" iconOnly pt={2} pb={3} iconSize={19} itemKey="settings" selected={panelKey} title="Settings" icon="settings" onClick={openPanelByKey('settings')} />
        </Card >
    )
}
