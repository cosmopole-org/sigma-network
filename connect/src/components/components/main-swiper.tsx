import { useCallback, useEffect, useRef } from "react";
import { Actions, RouteSys, Rx, States } from "@/api/client/states";

export default function MainSwiper(props: Readonly<{ contentKey: string, bottomKey: string, onOpen: () => void, onClose: () => void, content: any, bottom: any }>) {
    const pos = useRef(0)
    const movableRef = useRef<HTMLDivElement>(null);
    const touchRef = useRef(null)
    const touchable = useRef(true)
    const mdX = useRef(0)
    const mdY = useRef(0)
    const touchStartPosY = useRef(0)
    const touchStartPosX = useRef(0)
    const touchLastPosY = useRef(0)
    const touchLastPosX = useRef(0)
    const touchStartTop = useRef(0)
    const touchStartTime = useRef(0);
    const locked = useRef(false);
    const editing = States.useListener(States.store.boardEditingMode);
    const appsOpen = States.useListener(States.store.homeAppsOpen);
    const updatePos = useCallback((newVal: number) => {
        if (RouteSys._pathCount === 0) {
            if (!locked.current) {
                Rx.notify("update-home-spaces-menu-pos", { pos: newVal });
            }
        } else {
            if (newVal > window.innerWidth) newVal = window.innerWidth;
            pos.current = newVal
            movableRef.current && ((movableRef.current as HTMLElement).style.transform = `translateX(${pos.current}px)`)
        }
    }, [movableRef.current, pos.current]);
    useEffect(() => {
        const store = Rx.createHookStore();
        store.listen("switch-main-swiper", ({ open: o }: { open: boolean }) => updatePos(o ? window.innerWidth : 0));
        store.listen("update-home-swiping-lock", ({ locked: l }: { locked: boolean }) => { locked.current = l; });
        return () => store.destroy();
    }, []);
    useEffect(() => {
        if (RouteSys.lastAction === "back") {
            pos.current = 0;
            if (movableRef.current) {
                movableRef.current.style.transition = "";
                updatePos(0);
                setTimeout(() => {
                    if (movableRef.current) {
                        movableRef.current.style.transition = `transform .25s`;
                    }
                });
            }
        } else if (RouteSys.lastAction === "navigate") {
            pos.current = window.innerWidth;
            if (movableRef.current) {
                movableRef.current.style.transition = "";
                updatePos(window.innerWidth);
                setTimeout(() => {
                    if (movableRef.current) {
                        movableRef.current.style.transition = `transform .25s`;
                        updatePos(0);
                    }
                }, 100);
            }
        }
    }, [props.content]);

    let compsArr = []

    if (RouteSys._pathCount === 1) {
        compsArr = [
            {
                key: props.contentKey,
                isTop: true,
                component: props.content
            }
        ];
    } else if (RouteSys._pathCount > 1) {
        compsArr.push(
            {
                key: props.bottomKey,
                isTop: false,
                component: props.bottom
            },
            {
                key: props.contentKey,
                isTop: true,
                component: props.content
            }
        )
    }

    const changeTouchAbility = (el: any, state: string) => {
        el.style.pointerEvents = state;
    }

    return (
        <div className="w-full h-full">
            {compsArr.map((cd, i) => (
                <div
                    key={cd.key}
                    ref={
                        ((compsArr.length === 1 && i === 0) ||
                            (compsArr.length === 2 && i === 1)) ?
                            movableRef :
                            undefined}
                    style={{
                        transition: RouteSys._pathCount === 1 ? undefined : `transform .25s`,
                        transform: RouteSys._pathCount === 1 ? undefined : `translateX(0px)`,
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 2
                    }}
                >
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        {cd.component}
                    </div>
                </div>
            ))}
            <div
                ref={touchRef}
                style={{ width: 32, height: `100%`, position: 'absolute', left: 0, top: 56, zIndex: 2 }}
                onTouchStart={e => {
                    touchable.current = true;
                    touchStartTime.current = Date.now();
                    touchStartTop.current = pos.current;
                    touchStartPosY.current = e.touches[0].clientY;
                    touchStartPosX.current = e.touches[0].clientX;
                }}
                onTouchMove={e => {
                    let currentTouchPosY = e.touches[0].clientY;
                    let currentTouchPosX = e.touches[0].clientX;
                    if ((Math.abs(currentTouchPosX - touchStartPosX.current) > Math.abs(currentTouchPosY - touchStartPosY.current))) {
                        touchRef.current && changeTouchAbility(touchRef.current, 'auto');
                        touchLastPosY.current = currentTouchPosY;
                        touchLastPosX.current = currentTouchPosX;
                        let resPos = touchStartTop.current + currentTouchPosX - touchStartPosX.current;
                        if (resPos < 0) resPos = 0;
                        updatePos(resPos);
                    } else {
                        touchStartTime.current = 0;
                        updatePos((pos.current < (window.innerWidth - 150)) ? 0 : window.innerWidth);
                        touchable.current = false;
                        if (touchRef.current) {
                            (touchRef.current as any).style.display = 'none';
                        }
                    }
                }}
                onTouchEnd={() => {
                    if (touchRef.current) {
                        (touchRef.current as any).style.display = 'block';
                    }
                    if (((Math.abs(touchLastPosY.current - touchStartPosY.current) < 16) && (Math.abs(touchLastPosX.current - touchStartPosX.current) < 16))) {
                        // do nothing
                    } else if (touchable.current && touchLastPosX.current > 0 && touchLastPosY.current > 0) {
                        let now = Date.now();
                        if (touchStartTime.current > 0 && (((touchLastPosX.current - touchStartPosX.current) / ((now - touchStartTime.current) / 1000)) > 200)) {
                            if (RouteSys._pathCount === 0) {
                                Actions.updateHomeMenuState(true);
                            } else {
                                updatePos(window.innerWidth);
                                props.onClose();
                            }
                        } else if (touchStartTime.current > 0 && (((touchLastPosX.current - touchStartPosX.current) / ((now - touchStartTime.current) / 1000)) < -200)) {
                            if (RouteSys._pathCount === 0) {
                                Actions.updateHomeMenuState(false);
                            }
                        } else if (RouteSys._pathCount === 0) {
                            let open = (pos.current < (window.innerWidth - 150));
                            Actions.updateHomeMenuState(open);
                        } else {
                            let open = (pos.current < (window.innerWidth - 150));
                            updatePos(open ? 0 : window.innerWidth);
                            if (open) {
                                props.onOpen();
                            } else {
                                props.onClose();
                            }
                        }
                    }
                    touchStartTime.current = 0;
                    touchable.current = true;
                    touchLastPosY.current = 0;
                    touchLastPosX.current = 0;
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
                        touchRef.current && changeTouchAbility(touchRef.current, 'none');
                        let el = (document.elementFromPoint(mdX.current, mdY.current) as HTMLElement);
                        clickOnEl(el, e.clientX, e.clientY);
                        touchRef.current && changeTouchAbility(touchRef.current, 'auto');
                    }
                }}
            />
        </div>
    )
}
