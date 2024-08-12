"use client"

import { getUsers } from "@/api/offline/constants"
import { Avatar, Card } from "@nextui-org/react"
import { useRouter } from "next/navigation"

export default function HomePeopleList() {
    const router = useRouter();
    return (
        <div className="w-full h-auto pl-4 pr-4 pb-20">
            <Card onClick={() => {
                router.push('/app/profile/human')
            }} className="mt-4 m-h-16 w-full bg-transparent" key={'home'} isPressable shadow="none">
                <div className="flex gap-2 w-full">
                    <Avatar alt={"me"} className="w-[68px]" size="lg" />
                    <div className="flex flex-col relative w-full">
                        <span className="text-lg text-left">Me</span>
                        <span className="text-md text-default-400 text-left">No messsages exist in home...</span>
                        <span className="absolute right-0 top-1 text-sm">
                            Online 06:11 PM
                        </span>
                    </div>
                </div>
            </Card>
            {
                getUsers().map(item => (
                    <Card onClick={() => {
                        router.push('/app/profile/human')
                    }} className="mt-4 m-h-16 w-full bg-transparent" key={item.id} isPressable shadow="none">
                        <div className="flex gap-2 w-full">
                            <Avatar alt={item.name} className="w-[68px]" size="lg" src={item.avatar} />
                            <div className="flex flex-col relative w-full">
                                <span className="text-lg text-left">{item.name}</span>
                                <span className="text-md text-default-400 text-left">No messsages exist in home...</span>
                                <span className="absolute right-0 top-1 text-sm">
                                    Online 06:11 PM
                                </span>
                            </div>
                        </div>
                    </Card>
                ))
            }
        </div>
    )
}
