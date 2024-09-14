import { Actions, RouteSys, States } from "@/api/client/states";
import IconButton from "../elements/icon-button";
import { useEffect, useState } from "react";
import { Space } from "@/api/sigma/models";
import { api } from "@/index";

const pages: { [id: string]: string } = {
    "/app/profile": "Profile",
    "/app/contacts": "Contacts",
    "/app/room-machines": "Topic Machines",
    "/app/settings": "Settings",
    "/app/chats": "Chats",
    "/app/call": "Call",
    "/app/chat": "Chat",
    "/app/explore": "Explore",
    "/app/create-space": "Create Space",
    "/app/create-topic": "Create Topic",
}

export default function StatusBar() {
    const homeDrawerOpen = States.useListener(States.store.homeDrawerOpen);
    let hist = States.useListener(RouteSys.history);
    const pos = States.useListener(States.store.currentPos);
    const [space, setSpace] = useState<Space | null>();
    useEffect(() => {
        const spaceObservable = api.sigma.store.db.spaces.findOne(pos.spaceId).$;
        let spaceSub = spaceObservable.subscribe(s => {
            setSpace(s);
        });
        return () => {
            spaceSub.unsubscribe();
        }
    }, [pos.topicId]);
    let title = "";
    let leftSideBtn = null;
    if (pages[hist[hist.length - 1]?.path]) {
        leftSideBtn = <IconButton name="back" className="ml-1 -mt-[2px]" onClick={() => RouteSys.pop()} />;
    } else if (homeDrawerOpen) {
        leftSideBtn = <IconButton name="close" className="ml-1 -mt-[2px]" onClick={() => Actions.updateHomeMenuState(false)} />;
    } else {
        leftSideBtn = <IconButton name="menu" className="ml-1 -mt-[2px]" onClick={() => Actions.updateHomeMenuState(true)} />;
    }
    if (hist.length === 0) {
        title = space?.title ?? "";
    } else {
        title = pages[hist[hist.length - 1]?.path];
    }
    return (
        <div style={{ zIndex: 99998 }} className="shadow-medium flex w-[calc(100%-32px)] h-9 left-4 top-3 bg-white dark:bg-background absolute rounded-3xl pl-1 pr-1">
            {leftSideBtn}
            <IconButton color={'#006FEE'} name="connected" className="-mt-[2px]" />
            <div className="flex-1">
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 text-center pt-[7px] dark:text-white">
                {title}
            </div>
            <IconButton name="more" className="-mt-[2px]" />
        </div>
    )
}