import { Rx, States } from "@/api/offline/states";
import { ReactNode, useCallback, useEffect, useRef } from "react";

export default function HomeMenuDrawer({ content }: Readonly<{ content: ReactNode }>) {
    const drawerRef = useRef<HTMLDivElement>(null);
    const open = States.useListener(States.store.homeDrawerOpen);
    const measurePos = useCallback(() => {
        return open ? (window.innerWidth - 72) : 0;
    }, [open]);
    useEffect(() => {
        const store = Rx.createHookStore();
        store.listen("update-home-spaces-menu-pos", ({ pos }: { pos: number }) => {
            if (drawerRef.current && !open) {
                if (pos > window.innerWidth - 72) pos = window.innerWidth - 72;
                drawerRef.current.style.transform = `translateX(${pos}px)`;
            }
        });
        return () => store.destroy()
    }, [])
    return (
        <div ref={drawerRef} className="shadow-medium w-full h-full overflow-hidden" style={{ transform: `translateX(${measurePos()}px)`, transition: 'transform .25s' }}>
            <div className="w-full h-full overflow-hidden relative">
                {content}
            </div>
        </div>
    )
}