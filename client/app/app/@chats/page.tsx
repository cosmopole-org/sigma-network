"use client"

import React from "react";
import { Navbar, NavbarContent } from "@nextui-org/navbar";
import HomeSearchbar from "@/components/home/home-searchbar";
import HomeTowersList from "@/components/home/home-towers-list";
import { Button } from "@nextui-org/button";
import Icon from "@/components/elements/icon";
import HomeFoldersModal, { switchHomeFoldersModal } from "@/components/home/home-folders-modal";
import HomeArchiveModal, { switchHomeArchiveModal } from "@/components/home/home-archive-modal";
import TowerCreateModal, { switchTowerCreateModal } from "@/components/home/tower-create-modal";
import HomeFolders from "@/components/home/home-folders";

export default function ChatsPage() {
    return (
        <div className="w-full h-full relative overflow-y-auto bg-white dark:bg-content2">
            <Navbar
                isBordered
                className={'bg-content1 pt-16 pb-6'}
            >
                <NavbarContent as="div" className={"items-center w-full"} justify="center">
                    <div className={"w-full"}>
                        <HomeSearchbar />
                        <HomeFolders />
                    </div>
                </NavbarContent>
            </Navbar >
            <HomeTowersList />
            <div className="sticky bottom-[16px] h-10">
                <Button
                    isIconOnly
                    color="primary"
                    variant="shadow"
                    className="absolute right-2/4 translate-x-[155px]"
                    radius="full"
                    onClick={() => switchHomeFoldersModal(true)}
                >
                    <Icon name="storage" />
                </Button>
                <Button
                    isIconOnly
                    color="primary"
                    variant="shadow"
                    className="absolute left-2/4 -translate-x-[155px]"
                    radius="full"
                    onClick={() => switchHomeArchiveModal(true)}
                >
                    <Icon name="archive" />
                </Button>
                <Button
                    color="primary"
                    variant="shadow"
                    className="absolute left-2/4 -translate-x-1/2 h-10 text-lg"
                    radius="full"
                    onClick={() => switchTowerCreateModal(true)}
                >
                    <Icon name="add" />
                    Create new space
                </Button>
            </div>
            <TowerCreateModal />
            <HomeFoldersModal />
            <HomeArchiveModal />
        </div>
    )
}
