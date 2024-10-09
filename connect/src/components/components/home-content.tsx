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
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const showBoardBg = States.useListener(States.store.showBoardBackground);
    const board = useMemo(() => (
        <div
            className={"w-full h-auto pb-2 pt-[72px] -mt-8 gap-4 relative " + (showBoardBg ? "bg-s-white/60 dark:bg-content2/70" : "")}
            style={{ borderRadius: '32px 32px 0px 0px' }}
        >
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
    ), [showBoardBg]);
    const members = useMemo(() => <HomeAvatarGroup />, []);
    const infoBox = useMemo(() => <HomeInfoBox className="absolute top-8 left-0" />, []);
    const circles = useMemo(() => <Circles className="w-full h-full fixed" />, []);
    const backdrop = useMemo(() =>
        <Backdrop stateName="homeDrawerOpen" stateChangerName="updateHomeMenuState" />,
        []
    );
    return (
        <div className={"w-full h-full"}>
            <div ref={containerRef} className="w-full h-full relative overflow-x-hidden overflow-y-auto bg-white dark:bg-background">
                {circles}
                <div className="w-full h-[260px]" />
                <div className="absolute mt-[-32px] left-0 top-[200px] w-full h-full" style={{ borderRadius: '16px 16px 0px 0px' }} />
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
