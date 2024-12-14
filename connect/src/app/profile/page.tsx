import { getUsers } from "@/api/client/constants";
import { RouteSys, useTheme } from "@/api/client/states";
import { User } from "@/api/sigma/models";
import Circles from "@/components/components/circles";
import Icon from "@/components/elements/icon";
import IconButton from "@/components/elements/icon-button";
import Board from "@/components/room/room-board";
import { api } from "@/index";
import { Avatar, Button } from "@nextui-org/react";
import { useRef } from "react";

export default function ProfilePage({ user }: Readonly<{ user: User }>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const color = '#fff';
    return (
        <div ref={containerRef} className={"w-full h-full relative overflow-x-hidden overflow-y-auto"}>
            <div className="fixed left-0 top-0 w-full h-full bg-s-white dark:bg-background">
                <Circles className="sticky top-0 area" />
            </div>
            <IconButton color={color} name="back" className="absolute top-4 left-4 z-50" onClick={() => RouteSys.pop()} />
            <IconButton color={color} name="more" className="absolute top-4 right-4 z-50" />
            <div className="absolute top-8 left-0 overflow-hidden w-full h-auto">
                <Avatar className="w-32 h-32 ml-auto mr-auto mt-12" src={getUsers()[0].avatar} />
                <p className="text-xl text-center w-full mt-6" style={{ color: color }}>{user.name}</p>
            </div>
            <div className="justify-center flex w-full h-auto pl-4 pr-4 gap-4 absolute top-[280px]">
                <Button
                    onPress={() => {
                        api.sigma.services?.interacts.create({ userId: user.id }).then(res => {
                            RouteSys.push('/app/chat', { spaceId: res.data.space.id, topicId: res.data.topic.id });
                        })
                    }}
                    isIconOnly className="w-12 h-12 bg-white dark:bg-s-black" radius="full">
                    <Icon name='message' size={[24, 24]} />
                </Button>
                <Button
                    onPress={() => RouteSys.push('/app/call')}
                    isIconOnly className="w-12 h-12 bg-white dark:bg-s-black" radius="full">
                    <Icon name='toggleCam' size={[24, 24]} />
                </Button>
                <Button
                    onPress={() => RouteSys.push('/app/call')}
                    isIconOnly className="w-12 h-12 bg-white dark:bg-s-black" radius="full">
                    <Icon name='call2' size={[24, 24]} />
                </Button>
                <Button isIconOnly className="w-12 h-12 bg-white dark:bg-s-black" radius="full">
                    <Icon name='block' size={[24, 24]} />
                </Button>
            </div>
            <div
                className="w-full h-auto pb-2 pt-1 mt-[350px] gap-4 relative bg-s-white/60 dark:bg-content2/80"
                style={{ borderRadius: '24px 24px 0px 0px' }}
            >
                <Board
                    highlightColor={theme === 'light' ? '#006FEE' : '#7828C8'}
                    changeScrollLock={(v: boolean) => {
                        if (containerRef.current) {
                            containerRef.current.style.overflow = v ? 'hidden' : '';
                        }
                    }}
                    getSCrollY={() => {
                        return 350 - (containerRef.current?.scrollTop ?? 0);
                    }} />
            </div>
        </div>
    );
}
