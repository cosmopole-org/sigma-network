"use client"

import { getUsers } from "@/api/offline/constants";
import Icon from "@/components/elements/icon";
import IconButton from "@/components/elements/icon-button";
import Board from "@/components/room/room-board";
import { Avatar, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";

export default function HumanProfile() {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null);
    return (
        <div ref={containerRef} className={"w-full h-full relative overflow-x-hidden overflow-y-auto"}>
            <div className="fixed left-0 top-0 w-full h-full bg-s-white dark:bg-background" />
            <div className="area" style={{ backgroundColor: 'rgb(41, 98, 255)' }}>
                <ul className="circles">
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
            </div >
            <IconButton color="#fff" name="back" className="absolute top-4 left-4 z-50" onClick={() => router.back()} />
            <IconButton color="#fff" name="more" className="absolute top-4 right-4 z-50" />
            <div className="absolute top-4 left-0 overflow-hidden w-full h-auto">
                <Avatar className="w-32 h-32 ml-auto mr-auto mt-12" src={getUsers()[0].avatar} />
                <p className="text-xl text-center text-white w-full mt-6">Edward Kasperian</p>
            </div>
            <div className="justify-center flex w-full h-auto pl-4 pr-4 gap-4 absolute top-[280px]">
                <Button isIconOnly className="w-12 h-12 bg-white dark:bg-s-black" radius="full">
                    <Icon name='message' size={[24, 24]} />
                </Button>
                <Button isIconOnly className="w-12 h-12 bg-white dark:bg-s-black" radius="full">
                    <Icon name='toggleCam' size={[24, 24]} />
                </Button>
                <Button isIconOnly className="w-12 h-12 bg-white dark:bg-s-black" radius="full">
                    <Icon name='call' size={[24, 24]} />
                </Button>
                <Button isIconOnly className="w-12 h-12 bg-white dark:bg-s-black" radius="full">
                    <Icon name='block' size={[24, 24]} />
                </Button>
            </div>
            <div className="w-full h-auto pl-2 pr-2 pt-1 pb-2 gap-4">
                <div className="w-full h-auto absolute left-0">
                    <Board
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
    );
}
