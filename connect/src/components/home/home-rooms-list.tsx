import { Card } from "@nextui-org/react"
import { useEffect, useState } from "react"
import { Actions } from "@/api/client/states"
import IconButton from "../elements/icon-button"
import { Topic } from "@/api/sigma/models"
import { api } from "@/index"

export default function HomeRoomsList(props: Readonly<{ spaceId: string }>) {
    const [selectedTopicId, setSelectedTopicId] = useState("");
    const [topics, setTopics] = useState<Topic[]>([]);
    useEffect(() => {
        const topicsObservable = api.sigma.store.db.topics.find({ selector: { spaceId: { $eq: props.spaceId } } }).$;
        let topicsSub = topicsObservable.subscribe(ts => {
            if (selectedTopicId === "") {
                setSelectedTopicId(ts.length > 0 ? (ts[0] as any).id : "");
            }
            setTopics(ts);
        });
        api.sigma.services?.topics.read({ spaceId: props.spaceId });
        return () => {
            topicsSub.unsubscribe();
        }
    }, [props.spaceId]);
    return (
        <Card className="overflow-x-hidden w-full h-full pt-16" style={{
            borderRadius: 0
        }}>
            <Card radius="none" className="h-10 w-full">
                <div className="flex flex-row h-full w-full">
                    <p className="mt-2 ml-3 flex-1">
                        Space topics
                    </p>
                    <IconButton name="add" className="mr-2"
                        onClick={() => Actions.openCreateTopicModal(props.spaceId)}
                    />
                </div>
            </Card>
            <div
                className={"relative w-full overflow-scroll pl-4 pr-4"}
                style={{ height: 'calc(100% - 40px)' }}
            >
                {topics.map((item: Topic) => (
                    <Card onClick={() => {
                        Actions.updatePos(props.spaceId, item.id);
                        Actions.updateHomeMenuState(false);
                    }} className="mt-4 m-h-16 w-full bg-transparent" key={item.id} isPressable shadow="none">
                        <div className="flex gap-2 w-full">
                            <div className="flex flex-col">
                                <span className="text-md text-left">{item.title}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </Card>
    )
}