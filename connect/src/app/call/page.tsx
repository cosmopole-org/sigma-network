
import Icon from '@/components/elements/icon';
import { getUsers } from '../../api/client/constants';
import { Avatar, Button, Card } from "@nextui-org/react"
import { useState } from "react";
import { RouteSys } from '@/api/client/states';

export default function CallPage() {
    const [cam, setCam] = useState(false);
    const [mic, setMic] = useState(false);
    return (
        <div className="w-full h-full relative bg-white dark:bg-content1">
            <div className="overflow-y-auto grid grid-cols-2 w-full h-full pt-24 pl-8 pr-8 gap-8">
                {getUsers().map(item => (
                    <Card isPressable key={item.id} style={{ borderRadius: 16 }} shadow='none' className='bg-transparent h-48'>
                        <Avatar className="w-full h-full aspect-square" src={item.avatar} />
                        <p className="text-md text-center w-full mt-2">{item.name}</p>
                    </Card>
                ))}
                <div className='w-full h-[84px] grid-span-2' />
            </div>
            <Card radius='none' className="w-full h-[88px] fixed bottom-0 left-0 backdrop-blur-lg gap-6 items-center justify-center flex flex-row">
                <Button radius='full' isIconOnly className='w-12 h-12' onPress={() => setCam(!cam)}>
                    <Icon name='toggleCam' size={[32, 32]} color={cam ? '#0b7' : undefined} />
                </Button>
                <Button radius='full' isIconOnly className='w-14 h-14' color='danger' onPress={() => RouteSys.pop()}>
                    <Icon name='endCall' size={[32, 32]} />
                </Button>
                <Button radius='full' isIconOnly className='w-12 h-12' onPress={() => setMic(!mic)}>
                    <Icon name='toggleMic' size={[32, 32]} color={mic ? '#0b7' : undefined} />
                </Button>
            </Card>
        </div>
    )
}
