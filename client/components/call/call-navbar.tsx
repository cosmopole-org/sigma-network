"use client"

import React from "react";
import { Avatar, Navbar, NavbarContent } from "@nextui-org/react";
import IconButton from "../elements/icon-button";
import { useRouter } from "next/navigation";
import { getUsers } from '../../api/offline/constants';

export default function CallNavbar() {
    const router = useRouter();
    return (
        <Navbar
            isBordered
            className={"h-[64px] fixed"}
        >
            <NavbarContent as="div" className={"items-center w-full h-[64px]"} justify="center">
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
                            <span className="ml-3">Room 1 Call</span>
                        </p>
                        <IconButton name="settings" onClick={() => {

                        }} />
                    </div>
                </div>
            </NavbarContent>
        </Navbar >
    )
}
