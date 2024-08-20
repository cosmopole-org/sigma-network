'use client'

import { hookstate, useHookstate } from "@hookstate/core"
import { Card, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"
import { getUsers } from "@/api/offline/constants";
import Icon from "../elements/icon";
import Settings from "@/app/app/home/settings/page";
import Contacts from "@/app/app/home/contacts/page";

const contactsHomeModalShow = hookstate(false);
export const switchHomeContactsModal = (v: boolean) => {
    contactsHomeModalShow.set(v);
}

export default function HomeContactsModal() {
    const open = useHookstate(contactsHomeModalShow);
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
                        <ModalHeader className="flex flex-col gap-1">Contacts</ModalHeader>
                        <ModalBody className="p-0 overflow-y-auto" style={{ maxHeight: 600 }}>
                            <Contacts />
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
