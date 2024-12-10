import { Avatar, Button, Chip } from "@nextui-org/react";
import Icon from "../elements/icon";
import { RouteSys, States, useTheme } from "@/api/client/states";
import { useEffect, useState } from "react";
import { Space, Topic } from "@/api/sigma/models";
import { api } from "@/index";

export default function HomeInfoBox({ className }: Readonly<{ className: string }>) {
    const pos = States.useListener(States.store.currentPos);
    const showBoardBg = States.useListener(States.store.showBoardBackground);
    const { wallpaper } = useTheme();
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
        <div className={"overflow-hidden w-full h-[250px] absolute " + (className ?? "")} style={{ zIndex: 1 }}>
            <p className="ml-4 mt-[156px]" style={{ fontSize: 60 }}>{space ? topic?.title.substring(0, 2).trim() : ""}</p>
            {
                (!showBoardBg && (wallpaper === "true")) ? (
                    <Chip variant="flat" key={topic?.id} className="absolute left-24 text-lg top-[192px]">{topic?.title.substring(2)}</Chip>
                ) : (
                    <p key={topic?.id} className="absolute left-24 top-[204px] text-lg" ><b>{topic?.title.substring(2)}</b></p>
                )
            }
            <Button
                isIconOnly
                variant="shadow"
                color="primary"
                className="h-12 w-12 absolute top-20 right-0"
                style={{ borderRadius: '24px 0px 0px 24px' }}
                onPress={() => {
                    RouteSys.push("/app/room-machines")
                }}
            >
                <Icon name="settings" />
            </Button>
        </div>
    );
}
