'use client'

import { hookstate, useHookstate } from "@hookstate/core"
import { Card, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"
import { getUsers } from "@/api/offline/constants";
import Icon from "../elements/icon";
import Settings from "@/app/app/home/settings/page";

const settingsHomeModalShow = hookstate(false);
export const switchHomeSettingssModal = (v: boolean) => {
    settingsHomeModalShow.set(v);
}

export default function HomeSettingsModal() {
    const open = useHookstate(settingsHomeModalShow);
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
                        <ModalHeader className="flex flex-col gap-1">Settings</ModalHeader>
                        <ModalBody className="p-0">
                            <Settings />
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}