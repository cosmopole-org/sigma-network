import { Navbar, NavbarContent } from "@nextui-org/navbar";
import HomeSearchbar from "@/components/home/home-searchbar";
import HomeFolders from "@/components/home/home-folders";
import ChatsBottomBar from "@/components/components/chats-bottombar";
import ChatsFoldersModal from "@/components/modals/chats-folders-modal";
import ChatsArchiveModal from "@/components/modals/chats-archive-modal";
import ChatsList from "@/components/components/chats-list";
import { useState } from "react";

export default function ChatsPage() {
    const [currentCat, setCurrentCat] = useState("$.0");
    return (
        <div className="w-full h-full relative bg-white dark:bg-content1 overflow-hidden">
            <Navbar
                isBlurred
                isBordered
                className={'pt-[72px] pb-6'}
            >
                <NavbarContent as="div" className={"items-center w-full"} justify="center">
                    <div className={"w-full"}>
                        <HomeSearchbar />
                        <HomeFolders updateCurrentCat={setCurrentCat} />
                    </div>
                </NavbarContent>
            </Navbar >
            <ChatsList currentCat={currentCat} />
            <ChatsBottomBar />
            <ChatsFoldersModal />
            <ChatsArchiveModal />
        </div>
    )
}
