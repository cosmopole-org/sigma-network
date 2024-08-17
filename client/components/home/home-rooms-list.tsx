"use client"

import { Card } from "@nextui-org/react"
import IconButton from "../elements/icon-button"
import { getUsers } from "@/api/offline/constants"
import { hookstate, useHookstate } from "@hookstate/core"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { swipeNext } from "@/app/layout"

export const roomsListView = hookstate(false);
const roomsListViewExtra = hookstate(false);
export const switchRoomsList = (v: boolean) => {
    roomsListView.set(v);
}

export default function HomeRoomsList() {
    const roomsListState = useHookstate(roomsListView);
    const roomsListExtraState = useHookstate(roomsListViewExtra);
    const router = useRouter();
    useEffect(() => {
        setTimeout(() => {
            roomsListExtraState.set(roomsListState.get({ noproxy: true }));
        }, 250);
    }, [roomsListState.get({ noproxy: true })]);
    return (
        <Card className="fixed top-0 left-20 overflow-x-hidden w-full h-full" style={{
            borderRadius: 0
        }}>
            <Card radius="none" className="h-10">
                <div className="flex h-full">
                    <p className="mt-2 ml-2">
                        Tower rooms
                    </p>
                </div>
            </Card>
            <div
                className={"relative w-full overflow-scroll pl-4 pr-4"}
                style={{ height: 'calc(100% - 40px)' }}
            >
                {getUsers().map(item => (
                    <Card onClick={() => {
                        swipeNext();
                    }} className="mt-4 m-h-16 w-full bg-transparent" key={item.id} isPressable shadow="none">
                        <div className="flex gap-2 w-full">
                            <div className="flex flex-col">
                                <span className="text-md text-left">{item.emoji} {item.name}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </Card>
    )
}