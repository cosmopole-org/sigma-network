"use client"

import HomeFolders from "@/components/home/home-folders";
import HomeTowersList from "@/components/home/home-towers-list";
import HomeRoomsList from "@/components/home/home-rooms-list";
import HomeNavbar from "@/components/home/home-navbar";
import { Button } from "@nextui-org/react";
import Icon from "@/components/elements/icon";
import TowerCreateModal, { switchTowerCreateModal } from "@/components/home/tower-create-modal";
import HomeFoldersModal, { switchHomeFoldersModal } from "@/components/home/home-folders-modal";
import HomeArchiveModal, { switchHomeArchiveModal } from "@/components/home/home-archive-modal";

export default function Spaces() {
    return (
        <div className="w-full relative">
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
            <Button
                isIconOnly
                color="primary"
                variant="shadow"
                className="fixed bottom-[88px] right-2/4 translate-x-[155px]"
                radius="full"
                onClick={() => switchHomeFoldersModal(true)}
            >
                <Icon name="storage" />
            </Button>
            <Button
                isIconOnly
                color="primary"
                variant="shadow"
                className="fixed bottom-[88px] left-2/4 -translate-x-[155px]"
                radius="full"
                onClick={() => switchHomeArchiveModal(true)}
            >
                <Icon name="archive" />
            </Button>
            <TowerCreateModal />
            <HomeFoldersModal />
            <HomeArchiveModal />
        </div>
    );
}
