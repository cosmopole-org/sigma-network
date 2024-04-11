'use client'

import { hookstate, useHookstate } from "@hookstate/core"
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react"

const contactCreateModalShow = hookstate(false);
export const switchContactCreateModal = (v: boolean) => {
    contactCreateModalShow.set(v);
}

export default function ContactCreateModal() {
    const open = useHookstate(contactCreateModalShow);
    return (
        <Modal
            size={'4xl'}
            placement="center"
            isOpen={open.get({ noproxy: true })}
            onClose={() => open.set(false)}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Create new contact</ModalHeader>
                        <ModalBody>
                            <p>
                                Please enter your new contact info below.
                            </p>
                            <Input label="Contact Firstname" />
                            <Input label="Contact Lastname" />
                            <Input label="Phone Number" />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={onClose}>
                                Create
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}