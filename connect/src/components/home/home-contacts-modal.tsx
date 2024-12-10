'use client'

import { hookstate, useHookstate } from "@hookstate/core"
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"
import Icon from "../elements/icon";
import HomeNavbar from "./home-navbar";
import HomePeopleList from "./home-people-list";
import ContactCreateModal, { switchContactCreateModal } from "./contact-create-modal";

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
                        <ModalBody className="p-0 overflow-y-auto" style={{
                            maxHeight: window.innerHeight * 8 / 10 - 100
                        }}>
                            <HomeNavbar />
                            <HomePeopleList />
                            <div className="sticky bottom-[56px] h-10">
                                <Button
                                    color="primary"
                                    variant="shadow"
                                    className="absolute left-1/2 -translate-x-1/2 h-10 text-lg"
                                    radius="full"
                                    onPress={() => switchContactCreateModal(true)}
                                >
                                    <Icon name="add" />
                                    Create new contact
                                </Button>
                            </div>
                            <ContactCreateModal />
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
