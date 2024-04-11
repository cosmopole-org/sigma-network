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
    const roomsListState = useHookstate(roomsListView);
    const homeSectionState = useHookstate(selectedHomeSection);
    const homeNavShowState = useHookstate(homeNavShow);
    return (
        <Navbar
            isBordered
            className={'bg-white dark:bg-black ' + ((!roomsListState.get({ noproxy: true }) || (homeSectionState.get({ noproxy: true }) !== 'spaces')) ? undefined : 'fixed') + " " + (homeSectionState.get({ noproxy: true }) === 'spaces' ? "h-[164px] pb-2" : "h-[124px] pb-2")}
            style={{ transform: (homeNavShowState.get({ noproxy: true }) || roomsListState.get({noproxy: true})) ? 'translateY(0px)' : 'translateY(-100%)', transition: 'transform 400ms' }}
        >
            <NavbarContent as="div" className={"items-center w-full " + (homeSectionState.get({ noproxy: true }) === 'spaces' ? "h-[164px]" : "h-[128px]")} justify="center">
                <div className={"w-full"} style={{ paddingTop: (homeSectionState.get({ noproxy: true }) === 'spaces' ? 20 : 0) }}>
                    <div className="flex pl-1">
                        <HomeMenu />

                        <p className="text-xl flex-1 text-center">
                            Sigma
                        </p>
                        <HomeNotifications />
                    </div>
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
