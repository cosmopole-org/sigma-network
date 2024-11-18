import { Rx, States, useTheme } from "@/api/client/states";
import { ReactNode, useCallback, useEffect, useRef } from "react";

export default function HomeMenuDrawer(props: Readonly<{ open: any, content: ReactNode }>) {
    const drawerRef = useRef<HTMLDivElement>(null);
    const { navAsHome } = useTheme();
    const edgeWidth = navAsHome === "true" ? 0 : 72
    const open = States.useListener(props.open);
    const measurePos = useCallback(() => {
        return open ? (window.innerWidth - edgeWidth) : 0;
    }, [open]);
    useEffect(() => {
        const store = Rx.createHookStore();
        store.listen("update-home-spaces-menu-pos", ({ pos }: { pos: number }) => {
            if (drawerRef.current && !open) {
                if (pos > window.innerWidth - edgeWidth) pos = window.innerWidth - edgeWidth;
                drawerRef.current.style.transform = `translateX(${pos}px)`;
            }
        });
        return () => store.destroy()
    }, [])
    return (
        <div ref={drawerRef} className="shadow-medium w-full h-full overflow-hidden" style={{ transform: `translateX(${measurePos()}px)`, transition: 'transform .25s' }}>
            <div className="w-full h-full overflow-hidden relative">
                {props.content}
            </div>
        </div>
    )
}