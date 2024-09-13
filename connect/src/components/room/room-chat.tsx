
import { Input } from "@nextui-org/react";
import IconButton from "../elements/icon-button";
import MessageList from "./room-messagelist";
import RoomWallpaper from '../../images/room.jpg';
import { useTheme } from "@/api/client/states";

export default function Chat() {
    const { theme } = useTheme();
    return (
        <div className="w-full h-full overflow-hidden relative">
            <img alt={"chat-background"} src={RoomWallpaper} className="w-full h-full left-0 top-0 absolute" />
            <div key={'room-background-overlay'} className='bg-white dark:bg-content1' style={{
                opacity: theme === "dark" ? 0.85 : 0.35, width: '100%', height: '100%', position: 'absolute', left: 0, top: 0
            }} />
            <MessageList />
            <Input
                classNames={{
                    base: "h-10",
                    mainWrapper: "items-center h-full",
                    input: "text-small text-center",
                    inputWrapper: "shadow-medium bg-white dark:bg-background w-[90%] items-center absolute bottom-12 left-[5%] h-12 font-normal text-default-500 rounded-3xl",
                }}
                placeholder="Type your message..."
                size="lg"
                startContent={<IconButton name="attachment" size={[20, 20]} />}
                endContent={<IconButton name="send" size={[24, 24]} />}
            />
        </div>
    )
}
