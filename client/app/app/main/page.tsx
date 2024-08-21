"use client"

import { getUsers } from "@/api/offline/constants";
import MainTools from "@/components/home/main-tools-drawer";
import Board from "@/components/room/room-board";
import { Avatar, AvatarGroup } from "@nextui-org/react";
import { useTheme } from "next-themes";
import React, { useRef } from "react";
import HomePage from "../home/page";
import MainShadow from "@/components/home/main-shadow";
import { mainDrawerOpen, setMainDrawerSwitcher } from "@/app/layout";

const calcDrawerX = () => {
    return mainDrawerOpen.get({ noproxy: true }) ? (window.innerWidth - 720) : 0;
}

export default function HomeMain() {
    const containerRef = useRef<HTMLDivElement>(null);
    const drawerRef = useRef<HTMLDivElement>(null);
    setMainDrawerSwitcher((open: boolean) => {
        mainDrawerOpen.set(!mainDrawerOpen.get({ noproxy: true }));
        if (drawerRef.current) {
            if (open) drawerRef.current.style.transform = `translateX(${window.innerWidth - 72}px)`;
            else drawerRef.current.style.transform = `translateX(0px)`;
        }
    });
    const { theme } = useTheme();
    const color = '#fff';
    return (
        <div className="w-full h-full fixed">
            <div className="w-[85%] h-full overflow-x-hidden overflow-y-auto fixed">
                <HomePage />
            </div>
            <div ref={drawerRef} className="shadow-medium w-full h-full overflow-hidden" style={{ transform: `translaateX(${calcDrawerX()}px)`, transition: 'transform .25s' }}>
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
                        <MainShadow />
                    </div>
                </div>
            </div>
        </div>
    );
}
