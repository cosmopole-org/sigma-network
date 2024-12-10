'use client'

import { hookstate, useHookstate } from "@hookstate/core"
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"
import HomeTowersList from "@/components/home/home-towers-list";
import HomeNavbar from "@/components/home/home-navbar";
import Icon from "@/components/elements/icon";
import TowerCreateModal, {switchTowerCreateModal} from "@/components/home/tower-create-modal";
import HomeFoldersModal, {switchHomeFoldersModal} from "@/components/modals/home-folders-modal";
import HomeArchiveModal, {switchHomeArchiveModal} from "@/components/modals/home-archive-modal";

const chatsHomeModalShow = hookstate(false);
export const switchHomeChatsHomeModal = (v: boolean) => {
    chatsHomeModalShow.set(v);
}

export default function HomeChatsModal() {
    const open = useHookstate(chatsHomeModalShow);
    return (
        <Modal
            size={'lg'}
            placement="center"
            isOpen={open.get({ noproxy: true })}
            onClose={() => open.set(false)}
        >
            <ModalContent className="m-6">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Chats</ModalHeader>
                        <ModalBody className="p-0">
                            <div className="w-full h-full relative">
                                <HomeNavbar />
                                <HomeTowersList />
                                <div className="sticky bottom-[16px] h-10">
                                    <Button
                                        isIconOnly
                                        color="primary"
                                        variant="shadow"
                                        className="absolute right-2/4 translate-x-[155px]"
                                        radius="full"
                                        onPress={() => switchHomeFoldersModal(true)}
                                    >
                                        <Icon name="storage" />
                                    </Button>
                                    <Button
                                        isIconOnly
                                        color="primary"
                                        variant="shadow"
                                        className="absolute left-2/4 -translate-x-[155px]"
                                        radius="full"
                                        onPress={() => switchHomeArchiveModal(true)}
                                    >
                                        <Icon name="archive" />
                                    </Button>
                                    <Button
                                        color="primary"
                                        variant="shadow"
                                        className="absolute left-2/4 -translate-x-1/2 h-10 text-lg"
                                        radius="full"
                                        onPress={() => switchTowerCreateModal(true)}
                                    >
                                        <Icon name="add" />
                                        Create new space
                                    </Button>
                                </div>
                                <TowerCreateModal />
                                <HomeFoldersModal />
                                <HomeArchiveModal />
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}