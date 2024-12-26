import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@nextui-org/react";
import Chat from "../room/room-chat";
import { States } from "@/api/client/states";
import Files from "../room/room-files";
import MachinesList from "../home/machines-list";
import { api } from "@/index";
import { Member } from "@/api/sigma/models";

export default function HomeApps() {
    const pos = States.useListener(States.store.currentPos);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedDrawerApp = States.useListener(States.store.selectedDrawerApp);
    const [members, setMembers] = useState<Member[]>([]);
    useEffect(() => {
        const membersObservable = api.sigma.store.db.collections.members.find({
            selector: {
                spaceId: {
                    $eq: pos.spaceId
                }
            }
        }).$;
		let membersSub = membersObservable.subscribe(mems => {
            setMembers(mems);
		});
        return () => {
            membersSub.unsubscribe()
        }
    }, [pos.spaceId, pos.topicId]);
    const chat = useMemo(() => <Chat spaceId={pos.spaceId} topicId={pos.topicId} />, [pos.spaceId, pos.topicId]);
    const files = useMemo(() => <Files />, []);
    const bots = useMemo(() => <MachinesList className='pt-2' members={members} />, [members]);
    const chatRef = useRef<HTMLDivElement>(null);
    const botsRef = useRef<HTMLDivElement>(null);
    const filesRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (containerRef.current && botsRef.current && chatRef.current && filesRef.current) {
            if (selectedDrawerApp === "chat") {
                chatRef.current.style.transform = 'translateX(0px)';
                botsRef.current.style.transform = 'translateX(-100%)';
                filesRef.current.style.transform = 'translateX(-100%)';
            } else if (selectedDrawerApp === "bots") {
                chatRef.current.style.transform = 'translateX(-100%)';
                botsRef.current.style.transform = 'translateX(0%)';
                filesRef.current.style.transform = 'translateX(-100%)';
            } else {
                chatRef.current.style.transform = 'translateX(-100%)';
                botsRef.current.style.transform = 'translateX(-100%)';
                filesRef.current.style.transform = 'translateX(0%)';
            }
        }
    }, [selectedDrawerApp]);
    return (
        <Card className="overflow-hidden w-full h-full bg-content1">
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
                        <div ref={botsRef} className="w-screen h-full absolute left-0 top-0" style={{ transform: selectedDrawerApp === "bots" ? 'translateX(0px)' : 'translateX(-100%)' }}>{bots}</div>
                        <div ref={filesRef} className="w-screen h-full absolute left-0 top-0" style={{ transform: selectedDrawerApp === "files" ? 'translateX(0px)' : 'translateX(-100%)' }}>{files}</div>
                    </div>
                </div>
            </div>
        </Card>
    )
}
