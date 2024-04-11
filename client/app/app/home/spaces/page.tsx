"use client"

import HomeFolders from "@/components/home/home-folders";
import HomeTowersList from "@/components/home/home-towers-list";
import HomeRoomsList from "@/components/home/home-rooms-list";
import HomeNavbar from "@/components/home/home-navbar";
import { Button } from "@nextui-org/react";
import Icon from "@/components/elements/icon";
import TowerCreateModal, { switchTowerCreateModal } from "@/components/home/tower-create-modal";

export default function Spaces() {
    return (
        <div className="w-full relative bg-white dark:bg-darker-black">
            <HomeNavbar />
            <HomeTowersList />
            <HomeRoomsList />
            <HomeFolders secondary />
            <Button
                color="primary"
                variant="shadow"
                className="fixed bottom-[88px] left-2/4 -translate-x-1/2 h-10 text-lg"
                radius="full"
                onClick={() => switchTowerCreateModal(true)}
            >
                <Icon name="add" />
                Create new space
            </Button>
            <TowerCreateModal />
        </div>
    );
}
