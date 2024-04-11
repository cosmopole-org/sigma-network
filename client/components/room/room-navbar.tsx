"use client"

import { Avatar, Navbar, NavbarContent } from "@nextui-org/react";
import { hookstate, useHookstate } from "@hookstate/core";
import HomeSearchbar from "../home/home-searchbar";
import IconButton from "../elements/icon-button";
import { selectedRoomSection } from "./room-bottomnav";
import { getUsers } from "@/api/offline/constants";
import { useRouter } from "next/navigation";

const roomNavShow = hookstate(true);
export const switchRoomNav = (v: boolean) => {
    if (roomNavShow.get({ noproxy: true }) !== v) {
        roomNavShow.set(v)
    }
}

export default function RoomNavbar() {
    const router = useRouter();
    const roomSectionState = useHookstate(selectedRoomSection);
    const showSearchbar = ['board', 'files'].includes(roomSectionState.get({ noproxy: true }));
    const roomNavShowState = useHookstate(roomNavShow);
    return (
        <Navbar
            isBordered
            className={"sticky left-0 top-0 " + (showSearchbar ? "h-[120px] pb-4" : "h-[64px]")}
            style={{ transform: roomNavShowState.get({ noproxy: true }) ? 'translateY(0px)' : 'translateY(-100%)', transition: 'transform 400ms' }}
        >
            <NavbarContent as="div" className={"items-center w-full " + (showSearchbar ? "h-[120px]" : "h-[64px]")} justify="center">
                <div className={"w-full"}>
                    <div className="flex -ml-1">
                        <IconButton name="back" onClick={() => {
                            router.back();
                        }} />
                        <p className="text-xl flex-1 text-center flex text-center items-center justify-center">
                            <Avatar
                                isBordered
                                src={getUsers()[0].avatar}
                                color={"primary"}
                                name={"Room 1"}
                                size={"sm"}
                            />
                            <span className="ml-3">Room 1</span>
                        </p>
                        <IconButton name="call" onClick={() => {
                            router.push('/app/call')
                        }} />
                    </div>
                    {
                        showSearchbar ? (
                            <HomeSearchbar />
                        ) : null
                    }
                </div>
            </NavbarContent>
        </Navbar >
    )
}
