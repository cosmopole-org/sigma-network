
import AudioMessage from "./Message/AudioMessage"
import PhotoMessage from "./Message/PhotoMessage"
import TextMessage from "./Message/TextMessage"
import VideoMessage from "./Message/VideoMessage"
import MessageRow from "./Message/MessageRow"

const Message = (props: { side: string, messageType: string, lastOfSection?: boolean, firstOfSection?: boolean }) => {
    return (
        <MessageRow message={props.message} key={`chat-message-row-${props.message.id}`} side={props.side} lastOfSection={props.lastOfSection} firstOfSection={props.firstOfSection}>
            {/* {
                props.messageType === 'text' ? (
                    <TextMessage key={`chat-message-data-${props.message.id}`} message={props.message} side={props.side} lastOfSection={props.lastOfSection} firstOfSection={props.firstOfSection} />
                ) : props.messageType === 'photo' ? (
                    <PhotoMessage otherDocIds={props.messages.filter(msg => msg.type === 'photo').map(msg => msg.data.docId)} room={props.room} key={`chat-message-data-${props.message.id}`} message={props.message} side={props.side} lastOfSection={props.lastOfSection} firstOfSection={props.firstOfSection} />
                ) : props.messageType === 'video' ? (
                    <VideoMessage room={props.room} key={`chat-message-data-${props.message.id}`} message={props.message} side={props.side} lastOfSection={props.lastOfSection} firstOfSection={props.firstOfSection} />
                ) : props.messageType === 'audio' ? (
                    <AudioMessage otherDocIds={props.messages.filter(msg => msg.type === 'audio').map(msg => msg.data.docId)} room={props.room} key={`chat-message-data-${props.message.id}`} message={props.message} side={props.side} lastOfSection={props.lastOfSection} firstOfSection={props.firstOfSection} />
                ) : null
            } */}
                  <TextMessage
                  key={`chat-message-data-${props.message.id}`}
                  message={}
                  side={'right'}
                  lastOfSection={false}
                  firstOfSection={true}
                  />
        </MessageRow>
    )
}

export default Message
