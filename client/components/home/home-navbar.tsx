"use client"

import { Navbar, NavbarContent } from "@nextui-org/react";
import { hookstate, useHookstate } from "@hookstate/core";
import HomeFolders from "./home-folders";
import HomeMenu from "./home-menu";
import HomeSearchbar from "./home-searchbar";
import { roomsListView } from "./home-rooms-list";
import { selectedHomeSection } from "./home-bottomnav";
import HomeNotifications from "./home-notifications";

const homeNavShow = hookstate(true);
export const switchHomeNav = (v: boolean) => {
    if (homeNavShow.get({ noproxy: true }) !== v) {
        homeNavShow.set(v)
    }
}

export default function HomeNavbar() {
    const homeSectionState = useHookstate(selectedHomeSection);
    const homeNavShowState = useHookstate(homeNavShow);
    return (
        <Navbar
            isBordered
            className={'bg-content1 ' + (homeSectionState.get({ noproxy: true }) !== 'spaces' ? undefined : 'absolute') + " " + (homeSectionState.get({ noproxy: true }) === 'spaces' ? "h-[92px] pb-8" : "h-[56px] pb-10")}
            style={{ transform: homeNavShowState.get({ noproxy: true }) ? 'translateY(-1px)' : 'translateY(-100%)', transition: 'transform 400ms' }}
        >
            <NavbarContent as="div" className={"items-center w-full " + (homeSectionState.get({ noproxy: true }) === 'spaces' ? "h-[92px]" : "h-[56px]")} justify="center">
                <div className={"w-full"} style={{ paddingTop: (homeSectionState.get({ noproxy: true }) === 'spaces' ? 4 : 0) }}>
                    <HomeSearchbar />
                    {
                        homeSectionState.get({ noproxy: true }) === 'spaces' ? (
                            <HomeFolders />
                        ) : null
                    }
                </div>
            </NavbarContent>
        </Navbar >
    )
}
