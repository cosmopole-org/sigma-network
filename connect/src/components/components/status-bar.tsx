import { Actions, RouteSys, States } from "@/api/client/states";
import IconButton from "../elements/icon-button";

export default function StatusBar() {
    const homeDrawerOpen = States.useListener(States.store.homeDrawerOpen);
    let hist = States.useListener(RouteSys.history);
    let leftSideBtn = null;
    if ([
        "/app/profile",
        "/app/contacts",
        "/app/room-machines",
        "/app/settings",
        "/app/chats",
        "/app/call",
        "/app/chat",
        "/app/explore",
    ].includes(hist[hist.length - 1])) {
        leftSideBtn = <IconButton name="back" className="ml-1 -mt-[2px]" onClick={() => RouteSys.pop()} />;
    } else if (homeDrawerOpen) {
        leftSideBtn = <IconButton name="close" className="ml-1 -mt-[2px]" onClick={() => Actions.updateHomeMenuState(false)} />;
    } else {
        leftSideBtn = <IconButton name="menu" className="ml-1 -mt-[2px]" onClick={() => Actions.updateHomeMenuState(true)} />;
    }
    return (
        <div style={{ zIndex: 99998 }} className="shadow-medium flex w-[calc(100%-32px)] h-9 left-4 top-3 bg-white dark:bg-background absolute rounded-3xl pl-1 pr-1">
            {leftSideBtn}
            <IconButton color={'#006FEE'} name="connected" className="-mt-[2px]" />
            <div className="flex-1">
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 text-center pt-[7px] dark:text-white">
                Keyhan's Home
            </div>
            <IconButton name="more" className="-mt-[2px]" />
        </div>
    )
}