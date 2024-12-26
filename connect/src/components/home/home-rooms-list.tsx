import { Card, Divider } from "@nextui-org/react"
import { useEffect, useState } from "react"
import { Actions, States } from "@/api/client/states"
import IconButton from "../elements/icon-button"
import { Space, Topic } from "@/api/sigma/models"
import { api } from "@/index"
import HomeSearchbar from "./home-searchbar"

export default function HomeRoomsList(props: Readonly<{ title: string, isNavAsHome: boolean, spaceId: string }>) {
    const currentPos = States.useListener(States.store.currentPos);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [space, setSpace] = useState<Space>();
    useEffect(() => {
        const topicsObservable = api.sigma.store.db.topics.find({ selector: { spaceId: { $eq: props.spaceId } } }).$;
        let topicsSub = topicsObservable.subscribe(ts => {
            setTopics(ts);
        });
        const spaceObservable = api.sigma.store.db.spaces.findOne({ selector: { id: { $eq: props.spaceId } } }).$;
        let spaceSub = spaceObservable.subscribe(ts => {
            setSpace(ts as Space);
        });
        api.sigma.services?.topics.read({ spaceId: props.spaceId });
        return () => {
            topicsSub.unsubscribe();
            spaceSub.unsubscribe();
        }
    }, [props.spaceId]);
    return (
        <Card className="overflow-x-hidden h-full" style={{
            borderRadius: 0,
            width: props.isNavAsHome ? '100%' : 'calc(100% - 72px)'
        }}>
            <div
                className={"relative overflow-auto pl-4 pr-4"}
                style={{
                    width: 'calc(100% - 80px)',
                    height: 'calc(100% - 72px)'
                }}
            >
                <div className="w-full h-auto text-lg pb-2" style={{marginTop: props.isNavAsHome ? 16 : 56}}>
                    <div className="flex flex-row w-full">
                        <b className="pl-2">{props.title ?? ""}</b>
                        <IconButton name="settings" className="-mt-[6px]" size={[16, 16]} />
                    </div>
                    <div className="flex flex-row mt-1">
                        <div className="flex-1">
                            <HomeSearchbar className="mt-0" />
                        </div>
                        <IconButton name="add" className="bg-default-400/20 dark:bg-default-500/20 rounded-3xl ml-2"
                        onClick={() => {
                            Actions.openCreateTopicModal(props.spaceId);
                        }}/>
                    </div>
                    <Divider className="mt-3" />
                </div>
                {topics.map((item: Topic) => (
                    <Card onPress={() => {
                        Actions.updatePos(props.spaceId, item.id);
                        Actions.updateHomeMenuState(false);
                    }} className="mt-2 w-full bg-transparent" key={item.id} isPressable shadow="none">
                        <div className={"flex gap-2 w-full h-10 pt-2 pl-1 " + (currentPos.topicId === item.id ? "bg-content2" : "bg-transparent")}>
                            <div className="flex flex-row">
                                <span className="text-center w-8" style={{ fontSize: props.isNavAsHome ? 18 : 15 }}>{item.title.substring(0, 2)}</span>
                                <span className="text-left" style={{ fontSize: props.isNavAsHome ? 18 : 15 }}>{item.title.substring(2)}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </Card>
    )
}