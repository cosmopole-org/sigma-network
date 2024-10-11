import { States, useTheme } from "@/api/client/states"
import MainTools from "../home/main-tools-drawer"
import Circles from "./circles"
import { useMemo, useRef } from "react"
import Board from "../room/room-board"
import AddMacBtn from "./add-mac-btn"
import HomeAvatarGroup from "./home-avatar-group"
import HomeInfoBox from "./home-info-box"
import Backdrop from "./backdrop"

export default function HomeContent() {
    const { theme, wallpaper } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const showBoardBg = States.useListener(States.store.showBoardBackground);
    const board = useMemo(() => (
        <div
            style={{
                backdropFilter: ((wallpaper === "true") && showBoardBg) ? 'blur(10px)' : undefined
            }}
            className={"w-full h-auto pb-2 pt-[40px] -mt-8 gap-4 relative " + (showBoardBg ? "bg-s-white/70 dark:bg-content2/70" : "")}
        >
            {
                wallpaper !== "true" ? (
                    <img style={{ objectFit: 'cover' }} alt="header" className="w-full h-screen fixed top-0 left-0" src={
                        theme === "light" ?
                            "https://i.pinimg.com/736x/01/fc/bf/01fcbf9fc9932a394100ee51e4cf224f.jpg" :
                            "https://i.pinimg.com/control/564x/c0/83/92/c0839270bbdf8cdddd87aa92a33f70a2.jpg"
                    } />
                ) : null
            }
            {
                wallpaper !== "true" ? (
                    <div style={{ backdropFilter: 'blur(10px)' }} className={"w-full h-screen fixed top-0 left-0 " + (showBoardBg ? "bg-s-white/60 dark:bg-content2/60" : "")} />
                ) : null
            }
            <Board
                highlightColor={theme === 'light' ? '#006FEE' : '#7828C8'}
                changeScrollLock={(v: boolean) => {
                    if (containerRef.current) {
                        containerRef.current.style.overflow = v ? 'hidden' : '';
                    }
                }}
                getSCrollY={() => {
                    return 340 - (containerRef.current?.scrollTop ?? 0);
                }} />
        </div>
    ), [wallpaper, theme, showBoardBg]);
    const members = useMemo(() => <HomeAvatarGroup />, []);
    const infoBox = useMemo(() => <HomeInfoBox className="absolute top-8 left-0" />, [showBoardBg]);
    const backdrop = useMemo(() =>
        <Backdrop stateName="homeDrawerOpen" stateChangerName="updateHomeMenuState" />,
        []
    );
    const circles = useMemo(() => <Circles className="fixed top-0 left-0 w-full h-full" />, [wallpaper, theme, showBoardBg]);
    const cardLightColor = "#dddddd33";
    const cardDarkColor = "#00000011";
    return (
        <div className={"w-full h-full"}>
            <div ref={containerRef} className="w-full h-full relative overflow-x-hidden overflow-y-auto bg-white dark:bg-background">
                {circles}
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
                        <div className={"absolute left-2 top-[190px] w-[calc(100%-16px)] h-[84px]"}
                            style={{
                                borderRadius: 16,
                                backdropFilter: 'blur(10px)',
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
