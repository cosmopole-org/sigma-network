import { Message } from "@/api/sigma/models"
import MessageRow from "../layouts/MessageRow"
import TextMessage from "../room/Message/TextMessage"

const MessageContainer = (props: { message: Message, side: string, lastOfSection?: boolean, firstOfSection?: boolean }) => {
    return (
        <MessageRow message={props.message} key={`chat-message-row-${props.message.id}`} side={props.side} lastOfSection={props.lastOfSection} firstOfSection={props.firstOfSection}>
            {
                //props.message.tag === 'text' ? (
                    <TextMessage key={`chat-message-data-${props.message.id}`} message={props.message} side={props.side} lastOfSection={props.lastOfSection} firstOfSection={props.firstOfSection} />
                ///) : null
            }
        </MessageRow>
    )
}

export default MessageContainer;
