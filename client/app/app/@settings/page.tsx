"use client"

import React from "react";
import { Navbar, NavbarContent } from "@nextui-org/navbar";
import HomeSearchbar from "@/components/home/home-searchbar";
import HomeSettings from "@/components/home/home-settings";

export default function SettingsPage() {
    return (
        <div className="w-full h-full relative overflow-y-auto bg-white dark:bg-content2">
            <Navbar
                isBordered
                className={'bg-content1 pt-10 pb-4'}
            >
                <NavbarContent as="div" className={"items-center w-full"} justify="center">
                    <div className={"w-full"}>
                        <HomeSearchbar />
                    </div>
                </NavbarContent>
            </Navbar >
            <HomeSettings />
        </div>
    )
}
