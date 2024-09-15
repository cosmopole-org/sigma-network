
import Chat from '@/components/room/room-chat';

export default function ChatPage(props: Readonly<{ spaceId: string, topicId: string }>) {
    return <Chat className='mt-8' spaceId={props.spaceId} topicId={props.topicId} />
}
