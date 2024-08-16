
import { useRef } from "react";
import MetaContent from "./metaContent";
import { showRoomShadow } from "./shadow";
import { useHookstate } from "@hookstate/core";

const emojiPadHeight = 424;

export let switchMainDrawer = (open: boolean) => { }

let isChatKeyboardOpen = false;
let recalculateMetaCoverHeight = () => { }

const MainDrawer = (props: { onOpen: () => void, onClose: () => void, content: any }) => {
    const shadowRoomState = useHookstate(showRoomShadow);
    const metaRef = useRef(null);
    const left = useRef(0)
    const updateTop = (newVal: number) => {
        if (newVal > window.innerWidth - 72) newVal = window.innerWidth - 72;
        left.current = newVal
        metaRef.current && ((metaRef.current as HTMLElement).style.transform = `translateX(${left.current}px)`)
    }
    switchMainDrawer = (open: boolean) => {
        updateTop(open ? (window.innerWidth - 72) : 0)
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
                transform: `translateX(0px)`,
                borderRadius: '24px 24px 0px 0px',
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                zIndex: 2
            }}
        >
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                {props.content}
            </div>
            {
                shadowRoomState.get({ noproxy: true }) ? null : (
                    <div
                        ref={touchRef}
                        style={{ width: '100%', height: `calc(100% - ${isChatKeyboardOpen ? emojiPadHeight : 0}px)`, position: 'absolute', left: 0, top: 56, zIndex: 2 }}
                        onTouchStart={e => {
                            touchStartTop.current = left.current;
                            touchStartPosY.current = e.touches[0].clientY;
                            touchStartPosX.current = e.touches[0].clientX;
                        }}
                        onTouchMove={e => {
                            let currentTouchPosY = e.touches[0].clientY;
                            let currentTouchPosX = e.touches[0].clientX;
                            if ((Math.abs(currentTouchPosX - touchStartPosX.current) > Math.abs(currentTouchPosY - touchStartPosY.current))) {
                                touchRef.current && ((touchRef.current as HTMLElement).style.pointerEvents = 'auto');
                                touchLastPosY.current = currentTouchPosY;
                                touchLastPosX.current = currentTouchPosX;
                                let resPos = touchStartTop.current + currentTouchPosX - touchStartPosX.current;
                                if (resPos < 0) resPos = 0;
                                updateTop(resPos);
                            } else {
                                updateTop((left.current < (window.innerWidth - 150)) ? 0 : window.innerWidth);
                                touchRef.current && ((touchRef.current as HTMLElement).style.pointerEvents = 'none');
                                touchable.current = false;
                            }
                        }}
                        onTouchEnd={e => {
                            touchable.current = true;
                            touchRef.current && ((touchRef.current as HTMLElement).style.pointerEvents = 'auto');
                            if (((Math.abs(touchLastPosY.current - touchStartPosY.current) < 16) && (Math.abs(touchLastPosX.current - touchStartPosX.current) < 16))) {
                                // do nothing
                            } else if (touchable.current) {
                                updateTop((left.current < (window.innerWidth - 150)) ? 0 : window.innerWidth);
                            } else if ((Math.abs(touchLastPosX.current - touchStartPosX.current) > Math.abs(touchLastPosY.current - touchStartPosY.current))) {
                                updateTop((left.current < (window.innerWidth - 150)) ? 0 : window.innerWidth);
                                if (left.current < (window.innerWidth - 150)) {
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
                                touchRef.current && ((touchRef.current as HTMLElement).style.pointerEvents = 'auto');
                            }
                        }}
                    />
                )
            }
        </div>
    )
}

export default MainDrawer
