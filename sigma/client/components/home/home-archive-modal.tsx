"use client"

import { getUsers } from "@/api/offline/constants"
import { Avatar, Card, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"
import { switchRoomsList } from "./home-rooms-list"
import Icon from "../elements/icon"
import { hookstate, useHookstate } from "@hookstate/core"

const homeArchiveModalShow = hookstate(false);
export const switchHomeArchiveModal = (v: boolean) => {
    homeArchiveModalShow.set(v);
}

export default function HomeArchiveModal() {
    const open = useHookstate(homeArchiveModalShow);
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
                        <ModalHeader className="flex flex-col gap-1">Archived Towers</ModalHeader>
                        <ModalBody className="p-0">
                            <div className="w-full h-[400px] overflow-x-hidden overflow-y-auto pl-4 pr-4">
                                {getUsers().map((item) => (
                                    <Card onClick={
                                        () => {
                                            open.set(false);
                                            switchRoomsList(true);
                                        }
                                    }
                                        className="mt-4 m-h-16 w-full bg-transparent" key={item.id} isPressable shadow="none">
                                        <div className="flex gap-2 w-full">
                                            <Avatar alt={item.name} className="w-[58px] h-[58px]" src={item.avatar} style={{ minWidth: 58 }} />
                                            <div className="flex flex-col relative w-full">
                                                <span className="text-lg text-left">{item.name}</span>
                                                <span className="text-md text-default-400 text-left">No messsages exist in home...</span>
                                                <span className="absolute right-0 top-1 text-sm">
                                                    yesterday
                                                </span>
                                                <Icon name="dbl-tick" size={[16, 16]} className="absolute right-0 bottom-1 text-sm" />
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
