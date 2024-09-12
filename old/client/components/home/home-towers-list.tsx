"use client"

import { getUsers } from "@/api/offline/constants"
import { Avatar, Card } from "@nextui-org/react"
import Icon from "../elements/icon"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { RouteSys } from "@/api/offline/states"

export default function HomeTowersList() {
    const { theme } = useTheme();
    const router = useRouter();
    return (
        <div
            className="absolute top-0 w-full h-full pt-[160px] pl-4 pr-4 pb-20 overflow-y-auto">
            <div className="h-0" />
            <Card onClick={() => {
                RouteSys.push('/app/chat')
            }} className="mt-4 m-h-16 w-full bg-transparent" key={'home'} isPressable shadow="none">
                <div className="flex gap-2 w-full">
                    <Icon iconType="circle" name="home" size={[48, 48]} className="w-[68px] p-1" color={theme === 'light' ? "blue" : "#aaa"} />
                    <div className="flex flex-col relative w-full">
                        <span className="text-lg text-left">Home</span>
                        <span className="text-md text-default-400 text-left">No messsages exist in home...</span>
                        <span className="absolute right-0 top-1 text-sm">
                            yesterday
                        </span>
                        <Icon name="dbl-tick" size={[16, 16]} className="absolute right-0 bottom-1 text-sm" />
                    </div>
                </div>
            </Card>
            {
                getUsers().map((item, index) => (
                    <Card onClick={() => RouteSys.push('/app/chat')} className="mt-4 m-h-16 w-full bg-transparent" key={item.id} isPressable shadow="none">
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
                ))
            }
        </div >
    )
}
