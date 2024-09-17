import { useMemo } from "react";
import { Card } from "@nextui-org/react";
import Chat from "../room/room-chat";
import { States } from "@/api/client/states";
import Files from "../room/room-files";

export default function HomeApps() {
    const pos = States.useListener(States.store.currentPos);
    const selectedDrawerApp = States.useListener(States.store.selectedDrawerApp);
    const chat = useMemo(() => <Chat spaceId={pos.spaceId} topicId={pos.topicId} />, [pos.spaceId, pos.topicId]);
    const files = useMemo(() => <Files />, []);
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
                    <div style={{ width: '100%', height: `calc(100% - 40px)` }}>
                        {selectedDrawerApp === "chat" ? chat : files}
                    </div>
                </div>
            </div>
        </Card>
    )
}
