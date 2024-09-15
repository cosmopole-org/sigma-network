
import { Input } from "@nextui-org/react";
import IconButton from "../elements/icon-button";
import RoomWallpaper from '../../images/room.jpg';
import { useTheme } from "@/api/client/states";
import { useEffect, useRef, useState } from "react";
import { Topic } from "@/api/sigma/models";
import { api } from "@/index";
import MessageList from "./room-messagelist";

export default function Chat(props: Readonly<{ className?: string, spaceId: string, topicId: string }>) {
    const { theme } = useTheme();
    const textRef = useRef("");
    const [textElKey, setTextElKey] = useState(Math.random());
    const [topic, setTopic] = useState<Topic | null>();
    useEffect(() => {
        const topicObservable = api.sigma.store.db.topics.findOne(props.topicId).$;
        let topicSub = topicObservable.subscribe(t => {
            setTopic(t);
        });
        if (props.topicId) {
            api.sigma.services?.messages.read({ topicId: props.topicId, offset: 1, count: 1000 });
        }
        return () => {
            topicSub.unsubscribe();
        }
    }, [props.topicId]);
    return (
        <div className="w-full h-full overflow-hidden relative">
            <img alt={"chat-background"} src={RoomWallpaper} className="w-full h-full left-0 top-0 absolute" />
            <div key={'room-background-overlay'} className='bg-white dark:bg-content1' style={{
                opacity: theme === "dark" ? 0.85 : 0.35, width: '100%', height: '100%', position: 'absolute', left: 0, top: 0
            }} />
            <MessageList className={props.className} topicId={topic?.id ?? ""} />
            <Input
                key={textElKey}
                classNames={{
                    base: "h-10 absolute bottom-6 left-[5%] w-[90%]",
                    mainWrapper: "items-center h-full",
                    input: "text-small text-center",
                    inputWrapper: "shadow-medium bg-white dark:bg-background items-center h-12 font-normal text-default-500 rounded-3xl",
                }}
                onChange={e => { textRef.current = e.target.value; }}
                placeholder="Type your message..."
                size="lg"
                startContent={<IconButton name="attachment" size={[20, 20]} />}
                endContent={<IconButton name="send" size={[24, 24]}
                    onClick={() => {
                        if (textRef.current.length > 0) {
                            api.sigma.services?.messages.create({ spaceId: props.spaceId, topicId: props.topicId, data: { text: textRef.current } })
                            textRef.current = "";
                            setTextElKey(Math.random());
                        }
                    }} />}
            />
        </div>
    )
}
