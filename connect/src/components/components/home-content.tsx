import { States, useTheme } from "@/api/client/states"
import MainTools from "../home/main-tools-drawer"
import Circles from "./circles"
import { useEffect, useMemo, useRef, useState } from "react"
import Board from "../room/room-board"
import AddMacBtn from "./add-mac-btn"
import HomeAvatarGroup from "./home-avatar-group"
import HomeInfoBox from "./home-info-box"
import Backdrop from "./backdrop"
import { colors } from "@nextui-org/theme"
import Desk from "./desk"
import { Topic } from "@/api/sigma/models"
import { api } from "@/index"

export default function HomeContent() {
    const { theme, wallpaper } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const showBoardBg = States.useListener(States.store.showBoardBackground);
    const pos = States.useListener(States.store.currentPos);
    const [topic, setTopic] = useState<Topic|null>(null);
    useEffect(() => {
        api.sigma.store.db.collections.topics.findOne({selector: { id: { $eq: pos.topicId }}}).exec().then((t: any) => {
            setTopic(t);
        });
    }, [pos.topicId]);
    const board = useMemo(() => (topic ? <Desk room={topic} show={true} /> : null), [wallpaper, theme, showBoardBg, topic?.id]);
    const members = useMemo(() => <HomeAvatarGroup spaceId={"b7c28ed1-3a7c-42c7-9d87-a12fcd858a8e@sigma"} />, [pos.spaceId]);
    const infoBox = useMemo(() => <HomeInfoBox className="absolute top-8 left-0" />, [showBoardBg, wallpaper]);
    const backdrop = useMemo(() =>
        <Backdrop stateName="homeDrawerOpen" stateChangerName="updateHomeMenuState" />,
        []
    );
    const circles = useMemo(() => <Circles className="fixed top-0 left-0 w-full h-full" />, [wallpaper, theme, showBoardBg]);
    const cardLightColor = colors.blue[100];
    const cardDarkColor = colors.purple[900];
    return (
        <div className={"w-full h-full"}>
            <div ref={containerRef} className="w-full h-full relative overflow-x-hidden overflow-y-auto bg-white dark:bg-background">
                <div className="w-full h-[238px]" />
                {wallpaper !== "true" ? (
                    <img style={{ objectFit: 'cover', zIndex: 1 }} alt="header" className="w-full h-[230px] absolute top-0 left-0" src={
                        theme === 'light' ?
                            'https://i.pinimg.com/originals/80/ec/77/80ec77932091113c4970a88f69b9bb4f.gif' :
                            'https://i.pinimg.com/originals/bc/87/e5/bc87e5124f8d2cfe810d403adc96ad01.gif'
                    } />
                ) : null
                }
                <div className="w-full h-[32px]" />
                {
                    !showBoardBg ? (
                        <div className={"fixed left-0 top-0 w-full h-full"}
                            style={{
                                backgroundColor: theme === "light" ? cardLightColor : cardDarkColor
                            }} />
                    ) : null
                }
                {members}
                {board}
                {infoBox}
            </div>
            <AddMacBtn />
            <MainTools />
            {backdrop}
        </div>
    )
}
