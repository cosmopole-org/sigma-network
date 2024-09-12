import { Navbar, NavbarContent } from "@nextui-org/navbar";
import HomeSearchbar from "@/components/home/home-searchbar";
import TowerCreateModal from "@/components/home/tower-create-modal";
import HomeFolders from "@/components/home/home-folders";
import ChatsBottomBar from "@/components/components/chats-bottombar";
import ChatsFoldersModal from "@/components/modals/chats-folders-modal";
import ChatsArchiveModal from "@/components/modals/chats-archive-modal";
import TowersList from "@/components/components/towers-list";

export default function ChatsPage() {
    return (
        <div className="w-full h-full relative overflow-y-auto bg-white dark:bg-content1">
            <Navbar
                isBlurred
                isBordered
                className={'pt-[72px] pb-6'}
            >
                <NavbarContent as="div" className={"items-center w-full"} justify="center">
                    <div className={"w-full"}>
                        <HomeSearchbar />
                        <HomeFolders />
                    </div>
                </NavbarContent>
            </Navbar >
            <TowersList />
            <ChatsBottomBar />
            <TowerCreateModal />
            <ChatsFoldersModal />
            <ChatsArchiveModal />
        </div>
    )
}
