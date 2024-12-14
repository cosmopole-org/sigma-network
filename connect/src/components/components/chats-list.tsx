import { getUsers } from "@/api/client/constants"
import { Avatar, Card, Chip, colors } from "@nextui-org/react"
import Icon from "../elements/icon"
import { RouteSys } from "@/api/client/states"
import { useEffect, useState } from "react";
import { Interaction, Space, Topic, User } from "@/api/sigma/models";
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

export default function ChatsList({ currentCat }: { currentCat: string }) {
    const [interactsDict, setInteractsDict] = useState<{ [id: string]: Interaction }>({});
    const [spacesDict, setSpacesDict] = useState<{ [id: string]: Space }>({});
    const [topics, setTopics] = useState<Topic[]>([]);
    useEffect(() => {
        const interactsObservable = api.sigma.store.db.interactions.find().$;
        let interactsSub = interactsObservable.subscribe(inters => {
            let dict: { [id: string]: Interaction } = {};
            let usersDict: { [id: string]: User } = {};
            inters.forEach(inter => {
                dict[(inter.state as any)["spaceId"]] = inter;
            });
            api.sigma.store.db.users.find({
                selector: {
                    id: {
                        $in: inters.map(inter => inter.userId)
                    }
                }
            }).exec().then((users) => {
                users.forEach((user) => {
                    usersDict[user.id] = user;
                });
                Promise.all(inters.map(async inter => {
                    if (!usersDict[inter.userId]) {
                        let res = await api.sigma.services?.users.get({ userId: inter.userId });
                        if (res?.data?.user?.id) {
                            usersDict[res.data?.user.id] = res.data?.user;
                        }
                    }
                    (inter as any).participant = usersDict[inter.userId];
                })).then(() => {
                    setInteractsDict(dict);
                })
            })
        });
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
            interactsSub.unsubscribe();
            spacesSub.unsubscribe();
            topicsSub.unsubscribe();
        }
    }, [currentCat]);
    return (
        <div
            className="absolute top-0 w-full h-full pt-[160px] pl-4 pr-4 pb-20 overflow-y-auto">
            <div className="h-0" />
            {
                topics.filter(item => (
                    (currentCat === "$.0") ? ((interactsDict[item.spaceId] != undefined) && (interactsDict[item.spaceId] as any).participant.type === "human") :
                    (currentCat === "$.1") ? (interactsDict[item.spaceId] === undefined) : 
                    ((interactsDict[item.spaceId] != undefined) && (interactsDict[item.spaceId] as any).participant.type === "machine"))).map((item) => {
                    if (interactsDict[item.spaceId]) {
                        let participant = (interactsDict[item.spaceId] as any).participant;
                        return (
                            <Card onPress={() => RouteSys.push('/app/chat', { spaceId: item.spaceId, topicId: item.id })} className="mt-4 m-h-16 w-full bg-transparent" key={item.id} isPressable shadow="none">
                                <div className="flex gap-2 w-full">
                                    <Avatar isBordered alt={participant.name} className="w-[56px] h-[56px] m-1" src={getUsers()[Number(participant.avatar)].avatar} style={{ minWidth: 56 }} />
                                    <div className="flex flex-col relative w-full">
                                        <div className="w-full flex flex-row mt-1">
                                            <span className="text-lg text-left">
                                                {item.title}
                                            </span>
                                            <Chip className={"ml-2 text-white"} size="sm" variant="faded" style={{ backgroundColor: colorMap[stringToColour(participant.name + " " + participant.avatar, colorList)][600] }}>
                                                {participant.name}
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
                        )
                    } else {
                        return (
                            <Card onPress={() => RouteSys.push('/app/chat', { spaceId: item.spaceId, topicId: item.id })} className="mt-4 m-h-16 w-full bg-transparent" key={item.id} isPressable shadow="none">
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
                        )
                    }
                })
            }
        </div >
    )
}
