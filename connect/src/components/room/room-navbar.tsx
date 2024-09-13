"use client"

import { Avatar, Navbar, NavbarContent } from "@nextui-org/react";
import { hookstate, useHookstate } from "@hookstate/core";
import IconButton from "../elements/icon-button";
import { getUsers } from "@/api/client/constants";
import RoomSearchbar from "./room-searchbar";
import { useTheme } from "@/api/client/states";
import { RouteSys } from "@/api/client/states";

export const roomNavShow = hookstate(true);
export const switchRoomNav = (v: boolean) => {
    if (roomNavShow.get({ noproxy: true }) !== v) {
        roomNavShow.set(v)
    }
}

export default function RoomNavbar() {
    const { theme } = useTheme();
    const roomNavShowState = useHookstate(roomNavShow);
    return (
        <Navbar
            isBlurred={false}
            className={"sticky left-0 top-0 h-[128px] pb-4"}
            style={{ backdropFilter: 'blur(10px)', background: theme === 'light' ? 'rgba(41, 98, 255, 0.9)' : '#7828C8aa', transform: roomNavShowState.get({ noproxy: true }) ? 'translateY(0px)' : 'translateY(-100%)', transition: 'transform 400ms' }}
        >
            <NavbarContent as="div" className={"items-center w-full h-[128px]"} justify="center">
                <div className={"w-full mt-4 mb-2"}>
                    <div className="flex -ml-1">
                        <IconButton name="back" onClick={() => {
                            RouteSys.pop();
                        }} color="#fff" />
                        <p className="text-xl flex-1 text-center flex text-center items-center justify-center">
                            <span className="pl-4 pr-4 pt-2 pb-2 text-white">Room 1</span>
                        </p>
                        <Avatar
                            isBordered
                            src={getUsers()[0].avatar}
                            color={"primary"}
                            name={"Room 1"}
                            size={"sm"}
                            className="mt-1"
                        />
                    </div>
                    <RoomSearchbar />
                </div>
            </NavbarContent>
        </Navbar >
    )
}
