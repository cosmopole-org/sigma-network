"use client"

import { getUsers } from "@/api/offline/constants";
import MainDrawer, { switchMainDrawer } from "@/components/home/main-drawer";
import MainTools from "@/components/home/main-tools-drawer";
import MetaTouch, { changeMetaDrawerState } from "@/components/home/metaTouch";
import Shadow, { showRoomShadow } from "@/components/home/shadow";
import Board from "@/components/room/room-board";
import { Avatar, AvatarGroup, Button } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import HomePage from "../home/page";
import { useHookstate } from "@hookstate/core";
import IconButton from "@/components/elements/icon-button";
import HomeSettingsModal from "@/components/home/home-settings-modal";

export default function HomeMain() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
	const showRoom = useHookstate(showRoomShadow);
    const color = '#fff';
    return (
        <div className="w-full h-full fixed">
            <div className="w-[85%] h-full overflow-x-hidden overflow-y-auto fixed">
                <HomePage />
            </div>
            <MainDrawer content={
                <div className="w-full h-full overflow-hidden">
                    <div className="w-full h-full overflow-hidden relative">
                        <div ref={containerRef} className={"w-full h-full"}>
                            <div className="w-full h-full relative overflow-x-hidden overflow-y-auto bg-white dark:bg-background">
                                <div className="area" style={{ backgroundColor: theme === 'light' ? 'rgb(41, 98, 255)' : '#7828C8' }}>
                                    <ul className="circles">
                                        {Array.from(Array(10).keys()).map(i => <li style={{ backgroundColor: theme === 'light' ? '#fff7' : '#0005' }} key={i}></li>)}
                                    </ul>
                                </div>
                                <div className="absolute top-8 left-0 overflow-hidden w-full h-auto">
                                    <Avatar className="w-32 h-32 ml-auto mr-auto mt-12" src={getUsers()[0].avatar} />
                                    <p className="text-xl text-center w-full mt-6" style={{ color: color }}>My Books</p>
                                </div>
                                <div className="absolute mt-[-32px] left-0 top-[340px] w-full h-full bg-white dark:bg-background" style={{ borderRadius: '16px 16px 0px 0px' }} />
                                <div className="w-full h-12 -mt-12 relative">
                                    <AvatarGroup isBordered className="absolute left-1/2 -translate-x-1/2">
                                        <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                                        <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                                        <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                                        <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026302d" />
                                        <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
                                        <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
                                    </AvatarGroup>
                                </div>
                                <div className="w-full h-auto pl-2 pr-2 pb-2 pt-1 gap-4">
                                    <div className="w-full h-auto absolute left-0">
                                        <Board
                                            highlightColor={theme === 'light' ? '#006FEE' : '#7828C8'}
                                            changeScrollLock={(v: boolean) => {
                                                if (containerRef.current) {
                                                    containerRef.current.style.overflow = v ? 'hidden' : '';
                                                }
                                            }}
                                            getSCrollY={() => {
                                                return 550 - (containerRef.current?.scrollTop ?? 0);
                                            }} />
                                    </div>
                                </div>
                            </div>
                            <MainTools />
                        </div>
                    </div>
                    <div style={{ zIndex: 99999 }} className="shadow-medium flex w-[calc(100%-32px)] h-9 left-4 top-3 bg-white dark:bg-background absolute rounded-3xl pl-1 pr-1">
                        {
                            showRoom.get({ noproxy: true }) ? (
                                <IconButton name="close" className="ml-1 -mt-[2px]" onClick={() => {
                                    changeMetaDrawerState(false)
                                    showRoom.set(false)
                                }} />
                            ) : (
                                <IconButton name="menu" className="ml-1 -mt-[2px]" onClick={() => switchMainDrawer(true)} />
                            )
                        }
                        <IconButton color={'#006FEE'} name="connected" className="-mt-[2px]" />
                        <div className="flex-1">
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 pt-[7px] text-center">
                            {showRoom.get({ noproxy: true }) ? "Chat" : "Keyhan's Home"}
                        </div>
                        <IconButton name="more" className="-mt-[2px]" />
                    </div>
                </div>
            } onOpen={() => {
                switchMainDrawer(true);
            }} onClose={() => {
                switchMainDrawer(false);
            }} />
        </div>
    );
}
