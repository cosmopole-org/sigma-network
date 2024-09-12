"use client"

import { Tab, Tabs } from "@nextui-org/react";
import Icon from "../elements/icon";
import { hookstate, useHookstate } from "@hookstate/core";

const tabSelected = hookstate(0);

export default function MainAppsTabs({ secondary }: Readonly<{ secondary?: boolean }>) {
    const selectedState = useHookstate(tabSelected);
    return (
        <Tabs onSelectionChange={(v: any) => selectedState.set(v)} selectedKey={selectedState.get({ noproxy: true })} variant={"light"} color={"primary"} radius="full" aria-label="Tabs colors" fullWidth className={"bg-white dark:bg-content1 rounded-3xl ml-4 w-[calc(100%-32px)]"}>
            <Tab title={
                <div className="flex items-center space-x-2">
                    <Icon name="chat" />
                    <span>Chat</span>
                </div>
            } />
            <Tab title={
                <div className="flex items-center space-x-2">
                    <Icon name="blocks" />
                    <span>Apps</span>
                </div>
            } />
            <Tab title={
                <div className="flex items-center space-x-2">
                    <Icon name="storage" />
                    <span>Storage</span>
                </div>
            } />
        </Tabs>
    )
}
