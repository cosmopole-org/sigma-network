
import { ReactNode, useCallback, useEffect, useRef } from "react";
import { Rx, States } from "@/api/client/states";

export default function HomeAppsDrawer(props: Readonly<{ contentView: ReactNode, openedHeadView: ReactNode, closedHeadView: ReactNode, room: any, onOpen: () => void, onClose: () => void, needToCloseRecorder?: boolean }>) {
    const containerrRef = useRef(null);
    const pos = useRef(window.innerHeight)
    const open = States.useListener(States.store.homeAppsOpen);
    const mdX = useRef(0);
    const mdY = useRef(0);
    const touchStartPosY = useRef(0)
    const touchStartPosX = useRef(0)
    const touchLastPosY = useRef(0)
    const touchLastPosX = useRef(0)
    const touchStartTop = useRef(0)
    const touchRef = useRef(null)
    const touchable = useRef(true)
    const updatePos = useCallback((newVal: number) => {
        if (newVal > window.innerHeight - 72) newVal = window.innerHeight - 72;
        pos.current = newVal
        containerrRef.current && ((containerrRef.current as HTMLElement).style.transform = `translateY(${pos.current}px)`)
    }, [pos.current, containerrRef.current]);
    useEffect(() => {
        const store = Rx.createHookStore();
        store.listen("update-home-apps-drawer-pos", ({ open: o }: { open: boolean }) => updatePos(o ? 112 : (window.innerHeight - 72)));
        return () => store.destroy()
    }, []);
    return (
        <div
            ref={containerrRef}
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
            {open ? props.closedHeadView : props.openedHeadView}
            <div className="mt-2" style={{ width: '100%', height: '100%', position: 'relative' }}>
                {props.contentView}
            </div>
            {
                open ? (
                    <div
                        ref={touchRef}
                        style={{ width: '100%', height: 56, position: 'absolute', left: 0, top: 56, zIndex: 2 }}
                        onTouchStart={e => {
                            touchStartTop.current = pos.current;
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
                                        States.get(States.store.selectedDrawerApp) === "chat" ?
                                            (document.getElementById('messages-list')?.scrollTop === 0) :
                                            (document.getElementById('files-list')?.scrollTop === 0)

                                    ) &&
                                    (currentTouchPosY > touchStartPosY.current)
                                ) ||
                                (
                                    touchStartPosY.current <= (112 + 96)
                                )
                            ) {
                                touchRef.current && ((touchRef.current as HTMLElement).style.pointerEvents = 'auto');
                                touchLastPosY.current = currentTouchPosY;
                                touchLastPosX.current = currentTouchPosX;
                                let resPos = touchStartTop.current + currentTouchPosY - touchStartPosY.current;
                                if (resPos < 112) resPos = 112;
                                updatePos(resPos);
                            } else {
                                touchRef.current && ((touchRef.current as HTMLElement).style.pointerEvents = 'none');
                            }
                        }}
                        onTouchEnd={() => {
                            touchable.current = true;
                            touchRef.current && ((touchRef.current as HTMLElement).style.pointerEvents = 'auto');
                            if ((Math.abs(touchLastPosY.current - touchStartPosY.current) < 16) && (Math.abs(touchLastPosX.current - touchStartPosX.current) < 16)) {
                                // do nothihg
                            } else {
                                updatePos((pos.current < (window.innerHeight - 300)) ? 112 : window.innerHeight);
                                if (pos.current < (window.innerHeight - 300)) {
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
                ) : null
            }
        </div>
    )
}
