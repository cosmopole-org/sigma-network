import { Avatar, Button } from "@nextui-org/react";
import Icon from "../elements/icon";
import { RouteSys, States, useTheme } from "@/api/client/states";
import { getUsers } from "@/api/client/constants";
import { useEffect, useState } from "react";
import { Space, Topic } from "@/api/sigma/models";
import { api } from "@/index";

export default function HomeInfoBox({ className }: Readonly<{ className: string }>) {
    const pos = States.useListener(States.store.currentPos);
    const { theme } = useTheme();
    const [topic, setTopic] = useState<Topic | null>();
    const [space, setSpace] = useState<Space | null>();
    useEffect(() => {
        const topicObservable = api.sigma.store.db.topics.findOne(pos.topicId).$;
        let topicSub = topicObservable.subscribe(t => {
            setTopic(t);
        });
        const spaceObservable = api.sigma.store.db.spaces.findOne(pos.spaceId).$;
        let spaceSub = spaceObservable.subscribe(s => {
            setSpace(s);
        });
        return () => {
            topicSub.unsubscribe();
            spaceSub.unsubscribe();
        }
    }, [pos.topicId]);
    return (
        <div className={"overflow-hidden w-full h-auto absolute " + (className ?? "")} style={{ zIndex: 1}}>
            <Avatar color="default" isBordered className="w-16 h-16 ml-6 mt-[160px]" src={space ? getUsers()[Number(space.avatar)].avatar : undefined} />
            <p key={topic?.id} className="text-xl text-left mt-3 ml-5 text-content dark:text-white">{topic?.title}</p>
            <Button
                isIconOnly
                variant="shadow"
                color="secondary"
                className="h-12 w-12 absolute top-24 right-0"
                style={{ borderRadius: '24px 0px 0px 24px' }}
                onClick={() => {
                    RouteSys.push("/app/room-machines")
                }}
            >
                <Icon name="blocks" />
            </Button>
        </div>
    );
}
