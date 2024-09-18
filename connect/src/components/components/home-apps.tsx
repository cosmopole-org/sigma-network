import { useEffect, useMemo, useRef } from "react";
import { Card } from "@nextui-org/react";
import Chat from "../room/room-chat";
import { States } from "@/api/client/states";
import Files from "../room/room-files";

export default function HomeApps() {
    const pos = States.useListener(States.store.currentPos);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedDrawerApp = States.useListener(States.store.selectedDrawerApp);
    const chat = useMemo(() => <Chat spaceId={pos.spaceId} topicId={pos.topicId} />, [pos.spaceId, pos.topicId]);
    const files = useMemo(() => <Files />, []);
    const chatRef = useRef<HTMLDivElement>(null);
    const filesRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (containerRef.current && chatRef.current && filesRef.current) {
            if (selectedDrawerApp === "chat") {
                chatRef.current.style.transform = (selectedDrawerApp === "chat" ? 'translateX(0px)' : 'translateX(-100%)');
            } else {
                filesRef.current.style.transform = (selectedDrawerApp === "files" ? 'translateX(0px)' : 'translateX(+100%)');
            }
        }
    }, [selectedDrawerApp]);
    return (
        <Card className="overflow-hidden w-full h-full bg-white">
            <div
                style={{
                    height: 'calc(100% - 48px)'
                }}
            >
                <div style={{
                    position: 'relative', width: '100%', height: '100%'
                }}>
                    <div
                        style={{
                            width: '100%', height: 32,
                            borderRadius: '12px 12px 0px 0px', position: 'relative'
                        }}
                        className="bg-content1"
                    >
                        <div className="w-32 h-[4px] bg-primary ml-auto mr-auto translate-y-4 rounded-xl shadow-medium" />
                    </div>
                    <div ref={containerRef} style={{ width: '100%', height: `calc(100% - 40px)`, position: 'relative' }}>
                        <div ref={chatRef} className="w-screen h-full absolute left-0 top-0" style={{ transform: selectedDrawerApp === "chat" ? 'translateX(0px)' : 'translateX(-100%)' }}>{chat}</div>
                        <div ref={filesRef} className="w-screen h-full absolute left-0 top-0" style={{ transform: selectedDrawerApp === "files" ? 'translateX(0px)' : 'translateX(+100%)' }}>{files}</div>
                    </div>
                </div>
            </div>
        </Card>
    )
}
