'use client'

import { hookstate, useHookstate } from "@hookstate/core"
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"

const inboxHomeModalShow = hookstate(false);
export const switchHomeInboxHomeModal = (v: boolean) => {
    inboxHomeModalShow.set(v);
}

export default function HomeInboxModal() {
    const open = useHookstate(inboxHomeModalShow);
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
                        <ModalHeader className="flex flex-col gap-1">Notifications</ModalHeader>
                        <ModalBody className="p-0">
                            
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}