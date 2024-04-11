"use client"

import { Tab, Tabs } from "@nextui-org/react";
import Icon from "../elements/icon";

export default function HomeFolders({ secondary }: Readonly<{ secondary?: boolean }>) {
    return (
        <Tabs variant={secondary ? "solid" : "light"} color={"primary"} radius="full" aria-label="Tabs colors" fullWidth className={secondary ? "fixed top-4 left-4" : "mt-5 -ml-4"} style={{ width: secondary ? "calc(100% - 32px)" : "calc(100% + 32px)" }}>
            <Tab key="photos" title={
                <div className="flex items-center space-x-2">
                    <Icon name="gallery" />
                    <span>Photos</span>
                </div>
            } />
            <Tab key="music" title={
                <div className="flex items-center space-x-2">
                    <Icon name="music" />
                    <span>Music</span>
                </div>
            } />
            <Tab key="videos" title={
                <div className="flex items-center space-x-2">
                    <Icon name="video" />
                    <span>Videos</span>
                </div>
            } />
            <Tab key="photos2" title={
                <div className="flex items-center space-x-2">
                    <Icon name="gallery" />
                    <span>Photos</span>
                </div>
            } />
            <Tab key="music2" title={
                <div className="flex items-center space-x-2">
                    <Icon name="music" />
                    <span>Music</span>
                </div>
            } />
            <Tab key="videos2" title={
                <div className="flex items-center space-x-2">
                    <Icon name="video" />
                    <span>Videos</span>
                </div>
            } />
        </Tabs>
    )
}
