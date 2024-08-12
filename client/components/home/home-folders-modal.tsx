'use client'

import { hookstate, useHookstate } from "@hookstate/core"
import { Card, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"
import { getUsers } from "@/api/offline/constants";
import Icon from "../elements/icon";

const foldersHomeModalShow = hookstate(false);
export const switchHomeFoldersModal = (v: boolean) => {
    foldersHomeModalShow.set(v);
}

export default function HomeFoldersModal() {
    const open = useHookstate(foldersHomeModalShow);
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
                        <ModalHeader className="flex flex-col gap-1">Towers Folders</ModalHeader>
                        <ModalBody className="p-0">
                            <div className="w-full h-[400px] overflow-x-hidden overflow-y-auto pl-4 pr-4">
                                {getUsers().map(item => (
                                    <Card onClick={
                                        () => {
                                            open.set(false);
                                        }
                                    } className="mt-4 m-h-16 w-full bg-transparent" key={item.id} isPressable shadow="none">
                                        <div className="flex gap-2 w-full">
                                            <Icon iconType="circle" name="storage" size={[40, 40]} className="w-[68px]" />
                                            <div className="flex flex-col relative w-full">
                                                <span className="text-lg text-left">{item.name}</span>
                                                <span className="text-md text-default-400 text-left">3 towers</span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}