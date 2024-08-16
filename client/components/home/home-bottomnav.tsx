"use client"

import { Card } from "@nextui-org/react";
import { BottomNavItem } from "../elements/bottomnav-item";
import { hookstate, useHookstate } from "@hookstate/core";

export const selectedHomeSection = hookstate("spaces");
export const switchHomeSection = (s: string) => {
    selectedHomeSection.set(s);
}

export default function HomeBottomNav() {
    const selectedState = useHookstate(selectedHomeSection);
    const onItemClick = (key: string) => () => {
        selectedState.set(key);
    }
    return (
        <Card className="grid grid-cols-3 sticky bottom-0 left-0 w-full h-[72px]" style={{ borderRadius: '24px 24px 0px 0px', zIndex: 50 }}>
            <BottomNavItem itemKey="contacts" selected={selectedState.get({ noproxy: true })} title="Contacts" icon="people" onClick={onItemClick('contacts')} />
            <BottomNavItem itemKey="spaces" selected={selectedState.get({ noproxy: true })} title="Spaces" icon="city" onClick={onItemClick('spaces')} />
            <BottomNavItem pt={2} pb={3} iconSize={19} itemKey="settings" selected={selectedState.get({ noproxy: true })} title="Settings" icon="settings" onClick={onItemClick('settings')} />
        </Card >
    )
}
