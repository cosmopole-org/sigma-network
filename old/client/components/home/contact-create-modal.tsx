'use client'

import { hookstate, useHookstate } from "@hookstate/core"
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react"
import TextField from "../elements/textfield";

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
            <ModalContent className="m-6">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Create new contact</ModalHeader>
                        <ModalBody>
                            <p>
                                Please enter your new contact info below.
                            </p>
                            <TextField label="Contact Firstname" />
                            <TextField label="Contact Lastname" />
                            <TextField label="Phone Number" />
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