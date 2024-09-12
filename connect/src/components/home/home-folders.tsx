"use client"

import { Tab, Tabs } from "@nextui-org/react";
import Icon from "../elements/icon";
import { hookstate, useHookstate } from "@hookstate/core";

const tabSelected = hookstate(0);

export default function HomeFolders({ secondary, style }: Readonly<{ style?: any, secondary?: boolean }>) {
    const selectedState = useHookstate(tabSelected);
    return (
        <Tabs onSelectionChange={(v: any) => selectedState.set(v)} selectedKey={selectedState.get({ noproxy: true })} variant={"light"} color={"primary"} radius="full" aria-label="Tabs colors" fullWidth className={(secondary ? "fixed top-4 left-4 bg-content1 dark:bg-content1" : "mt-5 -ml-4 ") + "rounded-3xl"} style={{ ...style, borderRadius: 24, width: secondary ? "calc(100% - 32px)" : "calc(100% + 32px)" }}>
            <Tab title={
                <div className="flex items-center space-x-2">
                    <Icon name="human" />
                    <span>Humans</span>
                </div>
            } />
            <Tab title={
                <div className="flex items-center space-x-2">
                    <Icon name="group" />
                    <span>Groups</span>
                </div>
            } />
            <Tab title={
                <div className="flex items-center space-x-2">
                    <Icon name="bot" />
                    <span>Bots</span>
                </div>
            } />
        </Tabs>
    )
}
