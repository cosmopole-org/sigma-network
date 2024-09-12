
import { useRef } from "react";
import MetaContent, { metaActiveTab } from "./metaContent";
import { Button, Card, Tab, Tabs } from "@nextui-org/react";
import { useTheme } from "next-themes";
import MainBottomNav from "./main-bottomnav";
import Icon from "../elements/icon";
import { showRoomShadow } from "./shadow";
import { useHookstate } from "@hookstate/core";
import HomeFolders from "./home-folders";
import MainAppsTabs from "./main-apps-tabs";

const emojiPadHeight = 424;

export let changeMetaDrawerState = (open: boolean) => { }

let isChatKeyboardOpen = false;
let recalculateMetaCoverHeight = () => { }
export let setChatKeyboardOpen = (open: boolean) => {
    isChatKeyboardOpen = open;
    recalculateMetaCoverHeight()
}

const MetaTouch = (props: { room: any, onOpen: () => void, onClose: () => void, needToCloseRecorder?: boolean }) => {
    const showRoomsShadowState = useHookstate(showRoomShadow);
    const metaRef = useRef(null);
    const { theme } = useTheme();
    const top = useRef(window.innerHeight)
    const updateTop = (newVal: number) => {
        if (newVal > window.innerHeight - 72) newVal = window.innerHeight - 72;
        top.current = newVal
        metaRef.current && ((metaRef.current as HTMLElement).style.transform = `translateY(${top.current}px)`)
    }
    changeMetaDrawerState = (open: boolean) => {
        updateTop(open ? 112 : (window.innerHeight - 72))
    }
    const mdX = useRef(0);
    const mdY = useRef(0);
    const touchStartPosY = useRef(0)
    const touchStartPosX = useRef(0)
    const touchLastPosY = useRef(0)
    const touchLastPosX = useRef(0)
    const touchStartTop = useRef(0)
    const touchRef = useRef(null)
    const touchable = useRef(true)
    recalculateMetaCoverHeight = () => {
        if (touchRef.current) {
            (touchRef.current as HTMLElement).style.height = `calc(100% - ${isChatKeyboardOpen ? emojiPadHeight : 0}px)`;
        }
    }
    return (
        <div
            ref={metaRef}
            style={{
                transition: `transform .25s`,
                transform: `translateY(${window.innerHeight - 72}px)`,
                borderRadius: '24px 24px 0px 0px',
                height: window.innerHeight - 104,
                position: 'absolute',
                left: 0,
                top: 4,
                width: '100%',
                zIndex: 2
            }}
        >
            {
                showRoomsShadowState.get({ noproxy: true }) ? (
                    <MainAppsTabs />
                ) : (
                    <div className="flex gap-4 p-2 rounded-[28px] w-[calc(100%-64px)] ml-8 ">
                        <Button
                            isIconOnly
                            color="primary"
                            variant="shadow"
                            className="h-12 w-12"
                            radius="full"
                            onClick={() => {
                                changeMetaDrawerState(true);
                                showRoomShadow.set(true);
                            }}
                        >
                            <Icon name="chat" />
                        </Button>
                        <Button
                            color="primary"
                            variant="shadow"
                            className="flex-1 h-12 text-lg"
                            radius="full"
                            onClick={() => {
                                changeMetaDrawerState(!showRoomsShadowState.get({ noproxy: true }));
                                showRoomShadow.set(!showRoomsShadowState.get({ noproxy: true }));
                            }}
                        >
                            {showRoomsShadowState.get({ noproxy: true }) ? <Icon name="close" /> : <Icon name="blocks" />}
                            {showRoomsShadowState.get({ noproxy: true }) ? 'Close' : 'Open'} Apps
                        </Button>
                        <Button
                            isIconOnly
                            color="primary"
                            variant="shadow"
                            className="h-12 w-12"
                            radius="full"
                            onClick={() => {
                                changeMetaDrawerState(true);
                                showRoomShadow.set(true);
                            }}
                        >
                            <Icon name="storage" />
                        </Button>
                    </div>
                )
            }
            <div className="mt-2" style={{ width: '100%', height: '100%', position: 'relative' }}>
                <MetaContent room={props.room} needToCloseRecorder={props.needToCloseRecorder} />
            </div>
            <div
                ref={touchRef}
                style={{ width: '100%', height: `calc(100% - ${isChatKeyboardOpen ? emojiPadHeight : 0}px)`, position: 'absolute', left: 0, top: 56, zIndex: 2 }}
                onTouchStart={e => {
                    touchStartTop.current = top.current;
                    touchStartPosY.current = e.touches[0].clientY;
                    touchStartPosX.current = e.touches[0].clientX;
                }}
                onTouchMove={e => {
                    let currentTouchPosY = e.touches[0].clientY;
                    let currentTouchPosX = e.touches[0].clientX;
                    if (
                        (
                            (touchStartPosY.current > (112 + 96)) &&
                            (
                                metaActiveTab.get({ noproxy: true }) === 'chat' ?
                                    (document.getElementById('messages-list')?.scrollTop === 0) :
                                    (document.getElementById('files-list')?.scrollTop === 0)
                            ) &&
                            (currentTouchPosY > touchStartPosY.current)
                        ) ||
                        (
                            touchStartPosY.current <= (112 + 96)
                        )
                    ) {
                        console.log("1.....")
                        touchRef.current && ((touchRef.current as HTMLElement).style.pointerEvents = 'auto');
                        touchLastPosY.current = currentTouchPosY;
                        touchLastPosX.current = currentTouchPosX;
                        let resPos = touchStartTop.current + currentTouchPosY - touchStartPosY.current;
                        if (resPos < 112) resPos = 112;
                        updateTop(resPos);
                    } else {
                        console.log("2 ----")
                        touchRef.current && ((touchRef.current as HTMLElement).style.pointerEvents = 'none');
                    }
                }}
                onTouchEnd={e => {
                    touchable.current = true;
                    touchRef.current && ((touchRef.current as HTMLElement).style.pointerEvents = 'auto');
                    if ((Math.abs(touchLastPosY.current - touchStartPosY.current) < 16) && (Math.abs(touchLastPosX.current - touchStartPosX.current) < 16)) {
                        // do nothihg
                    } else {
                        updateTop((top.current < (window.innerHeight - 300)) ? 112 : window.innerHeight);
                        if (top.current < (window.innerHeight - 300)) {
                            props.onOpen();
                        } else {
                            props.onClose();
                        }
                    }
                }}
                onMouseDown={e => {
                    mdX.current = e.clientX;
                    mdY.current = e.clientY;
                }}
                onMouseUp={e => {
                    let muX = e.clientX;
                    let muY = e.clientY;
                    function triggerMouseEvent(node: any, eventType: string, x: number, y: number) {
                        node.dispatchEvent(new MouseEvent(eventType, {
                            view: window,
                            bubbles: true,
                            cancelable: true,
                            clientX: x,
                            clientY: y,
                            button: 0
                        }));
                    };
                    function clickOnEl(el: any, x: number, y: number) {
                        triggerMouseEvent(el, "mouseover", x, y);
                        triggerMouseEvent(el, "mousedown", x, y);
                        triggerMouseEvent(el, "mouseup", x, y);
                        triggerMouseEvent(el, "click", x, y);
                        el.focus();
                    }
                    if ((Math.abs(muX - mdX.current) < 16) && (Math.abs(muY - mdY.current) < 16)) {
                        touchRef.current && ((touchRef.current as HTMLElement).style.pointerEvents = 'none');
                        let el = (document.elementFromPoint(mdX.current, mdY.current) as HTMLElement);
                        clickOnEl(el, e.clientX, e.clientY);
                        console.log(el);
                        touchRef.current && ((touchRef.current as HTMLElement).style.pointerEvents = 'auto');
                    }
                }}
            />
        </div>
    )
}

export default MetaTouch
