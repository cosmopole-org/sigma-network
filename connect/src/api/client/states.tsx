import { hookstate, State, useHookstate } from "@hookstate/core";
import { useEffect } from "react";
import { Topic } from "../sigma/models";
import { closeAppletHost, minimizeAppletHost } from "@/components/components/applet-host";

export function useTheme() {
	const theme = useHookstate(States.store.theme);
	const wallpaper = useHookstate(States.store.wallpaper);
	const navAsHome = useHookstate(States.store.navAsHome);
	useEffect(() => {
		localStorage.setItem("theme", theme.get({ noproxy: true }));
		localStorage.setItem("wallpaper", wallpaper.get({ noproxy: true }));
		localStorage.setItem("navAsHome", navAsHome.get({ noproxy: true }));
		let body = document.getElementsByTagName("body")[0];
		if (body.classList.contains("light")) {
			body.classList.replace("light", theme.get({ noproxy: true }));
		} else {
			body.classList.replace("dark", theme.get({ noproxy: true }));
		}
		setTimeout(() => {
			Rx.notify("update-home-spaces-menu-pos", { pos: States.store.homeDrawerOpen.get({ noproxy: true }) ? (window.innerWidth - (States.store.navAsHome.get({ noproxy: true }) === "true" ? 0 : 72)) : 0 });
		});
	}, [theme.get({ noproxy: true }), wallpaper.get({ noproxy: true }), navAsHome.get({ noproxy: true })]);
	return {
		navAsHome: navAsHome.get({ noproxy: true }), setNavAsHome: navAsHome.set,
		theme: theme.get({ noproxy: true }), setTheme: theme.set,
		wallpaper: wallpaper.get({ noproxy: true }), setWallpaper: wallpaper.set
	};
}

let hookStateStore = {
	currentPos: hookstate({ spaceId: "", topicId: "" }),
	authenticated: hookstate(false),
	myUserId: localStorage.getItem("myUserId"),
	token: localStorage.getItem("token"),
	theme: hookstate(localStorage.getItem("theme") ?? "dark"),
	wallpaper: hookstate(localStorage.getItem("wallpaper") ?? ""),
	navAsHome: hookstate(localStorage.getItem("navAsHome") ?? "false"),
	showRoomLoading: hookstate(true),
	roomSliderView: hookstate(false),
	showLoading: hookstate(true),
	showMainLoading: hookstate(false),
	draggingId: hookstate<string | undefined>(undefined),
	showBoardBackground: hookstate(localStorage.getItem("showBoardBackground") === "true"),
	homeDrawerOpen: hookstate(false),
	boardEditingMode: hookstate(false),
	chatsFoldersModalOpen: hookstate(false),
	chatsArchiveModalOpen: hookstate(false),
	exploreSelectedTab: hookstate(0),
	homeAppsOpen: hookstate(false),
	authStep: hookstate(""),
	selectedDrawerApp: hookstate("chat"),
	appletShown: hookstate(false),
	appletLoaded: hookstate(false),
	appletFull: hookstate(false),
	overlayData: hookstate<{ workerId: string, code: string, room: Topic } | null>(null),
	overlayLoaded: hookstate(false),
	loadingOverlay: hookstate(false),
	currentAppletData: hookstate<{ id: string, room: Topic, code: string } | undefined>(undefined),
	minimizedApplets: hookstate<{ [id: string]: { room: Topic, code: string } }>({}),
	showAppletTabs: hookstate(false),
	topicDefaultWallpaper: hookstate(localStorage.getItem("topicDefaultWallpaper") ?? "")
};

export let States = {
	store: hookStateStore,
	useListener<T>(so: State<T>) {
		const s = useHookstate<T>(so);
		return s.get({ noproxy: true });
	},
	useListenerByKey(so: string) {
		const s = useHookstate((States.store as any)[so]);
		return s.get({ noproxy: true });
	},
	get<T>(so: State<T>) {
		return so.get({ noproxy: true });
	},
	getToken() {
		return this.store.token ?? "";
	},
	isFullscreen: () => Boolean(
		document.fullscreenElement ||
		(document as any).webkitFullscreenElement ||
		(document as any).mozFullScreenElement ||
		(document as any).msFullscreenElement
	),
};

export let Actions = {
	switchAppletTabs: (v: boolean) => {
		States.store.showAppletTabs.set(v);
	},
	closeApplet: (id: string) => {
		closeAppletHost(id);
		let minimizedApplets = States.store.minimizedApplets.get({ noproxy: true });
		let copied = { ...minimizedApplets };
		delete copied[id];
		States.store.minimizedApplets.set(copied);
	},
	minimizeApplet: () => {
		minimizeAppletHost();
		let appletData = States.store.currentAppletData.get({ noproxy: true })
		if (appletData) {
			States.store.minimizedApplets.set({
				...States.store.minimizedApplets.get({ noproxy: true }),
				[appletData.id]: { room: appletData.room, code: appletData.code }
			});
			Actions.switchAppletShown(false);
			Actions.switchAppletLoaded(false);
		}
	},
	restoreApplet: (id: string) => {
		let minizedApplets = States.store.minimizedApplets.get({ noproxy: true });
		if (minizedApplets[id]) {
			States.store.currentAppletData.set({ id, room: minizedApplets[id].room, code: minizedApplets[id].code });
			setTimeout(() => {
				States.store.appletShown.set(true);
				States.store.appletLoaded.set(true);
			});
		}
	},
	switchAppletFull: (v: boolean) => {
		States.store.appletFull.set(v);
	},
	hideAppletFetchingOverlay: () => {
		States.store.loadingOverlay.set(false);
	},
	appletCodeLoaded: (code: string) => {
		let appletData = States.store.currentAppletData.get({ noproxy: true });
		if (appletData) {
			States.store.currentAppletData.set({
				...appletData,
				code
			});
		}
	},
	switchAppletShown: (v: boolean, workerId?: string, room?: Topic) => {
		if (v && workerId && room) {
			States.store.loadingOverlay.set(true);
			States.store.currentAppletData.set({ id: workerId, room: room, code: "" });
		} else {
			States.store.loadingOverlay.set(false);
			States.store.currentAppletData.set(undefined);
		}
		States.store.appletShown.set(v);
	},
	switchAppletLoaded: (v: boolean) => {
		States.store.appletLoaded.set(v);
	},
	updateOverlayData: (v: { workerId: string, code: string, room: Topic } | null) => {
		States.store.overlayData.set(v);
	},
	switchOverlayLoaded: (v: boolean) => {
		States.store.overlayLoaded.set(v);
	},
	updatePos: (spaceId: string, topicId: string) => {
		States.store.currentPos.set({ spaceId, topicId });
	},
	updateAuthStep: (v: string) => {
		States.store.authStep.set(v);
	},
	updateSelectedDrawerApp: (v: string) => {
		States.store.selectedDrawerApp.set(v);
	},
	isAuthenticated: () => {
		return States.store.authenticated;
	},
	updateAuthenticated: (v: boolean) => {
		States.store.authenticated.set(v);
	},
	saveTopicDefaultWallpaper: (t: string) => {
		localStorage.setItem("topicDefaultWallpaper", t);
		States.store.topicDefaultWallpaper.set(t);
	},
	saveToken: (t: string) => {
		localStorage.setItem("token", t);
		States.store.token = t;
	},
	saveUserId: (userId: string) => {
		localStorage.setItem("myUserId", userId);
		States.store.myUserId = userId;
	},
	switchLoading: (v: boolean) => {
		States.store.showLoading.set(v);
	},
	switchMainLoading: (v: boolean) => {
		States.store.showMainLoading.set(v);
	},
	switchRoomLoading: (v: boolean) => {
		States.store.showRoomLoading.set(v);
	},
	swtichRoomSlider: (v: boolean) => {
		States.store.roomSliderView.set(v);
	},
	openCreateSpaceModal: () => {
		RouteSys.push("/app/create-space");
	},
	openCreateTopicModal: (spaceId: string) => {
		RouteSys.push("/app/create-topic", { spaceId });
	},
	switchDraggingId: (v: string | undefined) => {
		States.store.draggingId.set(v);
	},
	setShowBoardBackground: (v: boolean) => {
		localStorage.setItem("showBoardBackground", v + "");
		States.store.showBoardBackground.set(v);
	},
	updateHomeMenuState: (v: boolean) => {
		States.store.homeDrawerOpen.set(v);
		Rx.notify("update-home-swiping-lock", { locked: v });
		Rx.notify("update-home-spaces-menu-pos", { pos: v ? (window.innerWidth - (States.store.navAsHome.get({ noproxy: true }) === "true" ? 0 : 72)) : 0 });
	},
	switchBoardEditing: (v: boolean) => {
		States.store.boardEditingMode.set(v);
	},
	switchChatsFoldersModal: (v: boolean) => {
		States.store.chatsFoldersModalOpen.set(v);
	},
	switchChatsArchiveModal: (v: boolean) => {
		States.store.chatsArchiveModalOpen.set(v);
	},
	switchExploreTab: (v: number) => {
		States.store.exploreSelectedTab.set(v);
	},
	switchHomeApps: (v: boolean) => {
		States.store.homeAppsOpen.set(v);
		Rx.notify("update-home-apps-drawer-pos", { open: v });
	},
}

export let Rx: {
	hookStore: { [key: string]: { [key: string]: { en: string, fn: any, storeId: string } } },
	notify: (en: string, data: any) => void,
	createHookStore: () => { listen: (en: string, fn: any) => void, destroy: () => void }
} = {
	hookStore: {},
	notify: (en: string, data: any) => {
		Object.values(Rx.hookStore).forEach(eventGroup => {
			Object.values(eventGroup).forEach(e => {
				if (e.en === en) {
					e.fn(data);
				}
			});
		});
	},
	createHookStore: () => {
		const storeId = Math.random() + "-" + Math.random();
		return {
			listen: (en: string, fn: any) => {
				if (!Rx.hookStore[en]) {
					Rx.hookStore[en] = {};
				}
				Rx.hookStore[en][storeId] = { en, storeId, fn };
			},
			destroy: () => {
				Object.values(Rx.hookStore).forEach(eventGroup => {
					delete eventGroup[storeId];
				});
			},
		}
	},
}

export let RouteSys: {
	_pathCount: number,
	lastAction: string,
	swiperInst: any,
	history: State<{ path: string, state: any, key: string }[]>,
	push: (p: string, state?: any) => void,
	pop: (options?: { doNotSlideBack: boolean }) => void,
	replaceData: (pc: number, la: string, h: { path: string, state: any, key: string }[]) => void
} = {
	_pathCount: 0,
	lastAction: "",
	swiperInst: null,
	history: hookstate<{ path: string, state: any, key: string }[]>([]),
	push: (path: string, state?: any) => {
		let key = Math.random().toString().substring(2);
		RouteSys._pathCount++;
		RouteSys.lastAction = "navigate";
		RouteSys.history.set([...RouteSys.history.get({ noproxy: true }), { path, state, key }]);
	},
	pop: (options?: { doNotSlideBack: boolean }) => {
		if (!options?.doNotSlideBack) {
			Rx.notify("switch-main-swiper", { open: true });
			RouteSys._pathCount--;
			RouteSys.lastAction = 'back'
			setTimeout(() => {
				RouteSys.history.set([...RouteSys.history.get({ noproxy: true }).slice(0, RouteSys._pathCount)]);
			}, 250);
		} else {
			RouteSys._pathCount--;
			RouteSys.lastAction = 'back'
			setTimeout(() => {
				RouteSys.history.set([...RouteSys.history.get({ noproxy: true }).slice(0, RouteSys._pathCount)]);
			}, 250);
		}
	},
	replaceData: (pc: number, la: string, h: { path: string, state: any, key: string }[]) => {
		RouteSys._pathCount = pc;
		RouteSys.lastAction = la;
		RouteSys.history.set(h);
	}
};
