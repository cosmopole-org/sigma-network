'use client'

import { hookstate, useHookstate } from "@hookstate/core"
import { Card, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"
import { getUsers } from "@/api/offline/constants";
import Icon from "../elements/icon";
import Settings from "@/app/app/home/settings/page";
import Contacts from "@/app/app/home/contacts/page";
import Spaces from "@/app/app/home/spaces/page";

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
                            <Spaces />
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}