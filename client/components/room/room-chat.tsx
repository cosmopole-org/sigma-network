
import { Input } from "@nextui-org/react";
import MessageList from "./room-messagelist";
import IconButton from "../elements/icon-button";

export default function Chat() {
    return (
        <div className="w-full overflow-hidden relative" style={{height: 'calc(100% - 64px)'}}>
            <MessageList />
            <Input
                classNames={{
                    base: "h-10",
                    mainWrapper: "items-center h-full",
                    input: "text-small text-center",
                    inputWrapper: "w-[90%] backdrop-blur items-center fixed bottom-20 left-[5%] h-12 font-normal text-default-500 rounded-3xl",
                }}
                placeholder="Type your message..."
                size="lg"
                startContent={<IconButton name="attachment" size={[20, 20]} />}
                endContent={<IconButton name="send" size={[24, 24]} />}
            />
        </div>
    )
}