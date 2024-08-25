"use client"

import { Card } from "@nextui-org/react";
import { BottomNavItem } from "../elements/bottomnav-item";
import { hookstate, useHookstate } from "@hookstate/core";
import { RouteSys } from "@/api/offline/states";

export const selectedHomeSection = hookstate("spaces");
export const switchHomeSection = (s: string) => {
    selectedHomeSection.set(s);
}

export default function HomeBottomNav({ style }: Readonly<{ style?: any }>) {
    const onItemClick = (key: string) => () => {
        switch (key) {
            case "contacts": {
                RouteSys.push("/app/contacts");
                break;
            }
            case "settings": {
                RouteSys.push("/app/settings");
                break;
            }
            case "chats": {
                RouteSys.push("/app/chats");
                break;
            }
        }
    }
    return (
        <Card className="grid grid-cols-3 sticky bottom-0 left-0 w-full h-[72px]" style={{
            borderRadius: '24px 24px 0px 0px', zIndex: 50,
            ...style
        }}>
            <BottomNavItem itemKey="contacts" selected={""} title="Contacts" icon="people" onClick={onItemClick('contacts')} />
            <BottomNavItem itemKey="chats" selected={""} title="Chats" icon="chat" onClick={onItemClick('chats')} />
            <BottomNavItem pt={2} pb={3} iconSize={19} itemKey="settings" selected={""} title="Settings" icon="settings" onClick={onItemClick('settings')} />
        </Card>
    )
}
