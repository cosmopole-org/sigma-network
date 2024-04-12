'use client'

import { hookstate, useHookstate } from "@hookstate/core"
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react"
import TextField from "../elements/textfield";

const towerCreateModalShow = hookstate(false);
export const switchTowerCreateModal = (v: boolean) => {
    towerCreateModalShow.set(v);
}

export default function TowerCreateModal() {
    const open = useHookstate(towerCreateModalShow);
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
                        <ModalHeader className="flex flex-col gap-1">Create new tower</ModalHeader>
                        <ModalBody>
                            <p>
                                Please choose a name for your tower.
                            </p>
                            <TextField label="Tower Name" />
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