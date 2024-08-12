
import { Input } from "@nextui-org/react";
import IconButton from "../elements/icon-button";
import MessageList from "./room-messagelist";

export default function Chat() {
    return (
        <div className="w-full h-full overflow-hidden relative">
            <MessageList />
            <Input
                classNames={{
                    base: "h-10",
                    mainWrapper: "items-center h-full",
                    input: "text-small text-center",
                    inputWrapper: "bg-content2 w-[90%] backdrop-blur items-center absolute bottom-12 left-[5%] h-12 font-normal text-default-500 rounded-3xl",
                }}
                placeholder="Type your message..."
                size="lg"
                startContent={<IconButton name="attachment" size={[20, 20]} />}
                endContent={<IconButton name="send" size={[24, 24]} />}
            />
        </div>
    )
}
