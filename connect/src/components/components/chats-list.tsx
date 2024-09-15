import { getUsers } from "@/api/client/constants"
import { Avatar, Card, Chip, colors } from "@nextui-org/react"
import Icon from "../elements/icon"
import { RouteSys } from "@/api/client/states"
import { useEffect, useState } from "react";
import { Space, Topic } from "@/api/sigma/models";
import { api } from "@/index";
import { stringToColour } from "@/api/utils";

const colorMap: { [id: string]: any } = {
    "blue": colors.blue,
    "cyan": colors.cyan,
    "green": colors.green,
    "pink": colors.pink,
    "purple": colors.purple,
    "red": colors.red,
    "yellow": colors.yellow,
}

const colorList = Object.keys(colorMap);

export default function ChatsList() {
    const [spacesDict, setSpacesDict] = useState<{ [id: string]: Space }>({});
    const [topics, setTopics] = useState<Topic[]>([]);
    useEffect(() => {
        const spacesObservable = api.sigma.store.db.spaces.find().$;
        let spacesSub = spacesObservable.subscribe(ss => {
            let dict: { [id: string]: Space } = {};
            ss.forEach(s => { dict[s.id] = s; })
            setSpacesDict(dict);
        });
        const topicsObservable = api.sigma.store.db.topics.find().$;
        let topicsSub = topicsObservable.subscribe(ts => {
            setTopics(ts);
        });
        return () => {
            spacesSub.unsubscribe();
            topicsSub.unsubscribe();
        }
    }, []);
    return (
        <div
            className="absolute top-0 w-full h-full pt-[160px] pl-4 pr-4 pb-20 overflow-y-auto">
            <div className="h-0" />
            {
                topics.map((item) => (
                    <Card onClick={() => RouteSys.push('/app/chat', { spaceId: item.spaceId, topicId: item.id })} className="mt-4 m-h-16 w-full bg-transparent" key={item.id} isPressable shadow="none">
                        <div className="flex gap-2 w-full">
                            <Avatar isBordered alt={item.title} className="w-[56px] h-[56px] m-1" src={getUsers()[Number(spacesDict[item.spaceId].avatar)].avatar} style={{ minWidth: 56 }} />
                            <div className="flex flex-col relative w-full">
                                <div className="w-full flex flex-row mt-1">
                                    <span className="text-lg text-left">
                                        {item.title}
                                    </span>
                                    <Chip className={"ml-2 text-white"} size="sm" variant="faded" style={{ backgroundColor: colorMap[stringToColour(spacesDict[item.spaceId].title + " " + spacesDict[item.spaceId].avatar, colorList)][600] }}>
                                        {spacesDict[item.spaceId].title}
                                    </Chip>
                                </div>
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
