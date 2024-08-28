"use client"

import { hookstate, State } from "@hookstate/core";
import { useRouter } from "next/navigation";

export const showRoomLoading = hookstate(true);
export const switchRoomLoading = (v: boolean) => {
	showRoomLoading.set(v);
}

export const roomSliderView = hookstate(false);
export const swtichRoomSlider = (v: boolean) => {
	roomSliderView.set(v);
}

export const showLoading = hookstate(true);
export const switchLoading = (v: boolean) => {
	showLoading.set(v);
}

export const showMainLoading = hookstate(false);
export const switchMainLoading = (v: boolean) => {
	showMainLoading.set(v);
}

export const draggingId = hookstate<string | undefined>(undefined);
export const switchDraggingId = (v: string) => {
	draggingId.set(v);
}

const pathes = [
	"/app/home",
	"/app/chat",
	"/app/call",
	"/app/profile",
	"/app/contacts",
	"/app/settings",
	"/app/chats",
]
export let RouteSys: {
	_pathCount: number,
	lastAction: string,
	swiperInst: any,
	history: State<string[]>,
	push: (p: string, options?: { changePath?: boolean }) => void,
	pop: (options?: { doNotSlideBack: boolean }) => void,
	putSwiper: (i: any) => void
} = {
	_pathCount: 1,
	lastAction: "",
	swiperInst: null,
	history: hookstate<string[]>(["/app/home"]),
	push: (p: string) => { },
	pop: (options?: { doNotSlideBack: boolean }) => { },
	putSwiper: (i: any) => {
		RouteSys.swiperInst = i;
	}
};

export const RouterComponent = () => {
	const router = useRouter();
	RouteSys.push = (p: string, options?: { changePath?: boolean }) => {
		RouteSys._pathCount++;
		RouteSys.lastAction = "navigate";
		RouteSys.history.set([...RouteSys.history.get({ noproxy: true }), p]);
	}
	RouteSys.pop = (options?: { doNotSlideBack?: boolean }) => {
		if (RouteSys.history.get({ noproxy: true }).length > 1) {
            if (!options?.doNotSlideBack) {
                RouteSys.swiperInst?.slidePrev();
            } else {
				RouteSys._pathCount--;
                RouteSys.lastAction = 'back'
                setTimeout(() => {
					RouteSys.history.set([...RouteSys.history.get({ noproxy: true }).slice(0, RouteSys._pathCount)]);
                }, 250);
            }
        }
	}
	return <div></div>
}

export const enableSwiper = () => {
	if (RouteSys.swiperInst) {
		RouteSys.swiperInst.enable();
	}
}
export const disableSwiper = () => {
	if (RouteSys.swiperInst) {
		RouteSys.swiperInst.disable();
	}
}
export let swipeNext = () => {
	switchMainDrawer(false);
}

export let switchMainDrawer = (open: boolean) => { }
export let setMainDrawerSwitcher = (mds: (open: boolean) => void) => {
	switchMainDrawer = mds;
}
export let mainDrawerOpen = hookstate(false);
