import { hookstate, State, useHookstate } from "@hookstate/core";
import { useEffect } from "react";

export function useTheme() {
	const theme = useHookstate(States.store.theme);
	useEffect(() => {
		localStorage.setItem("theme", theme.get({ noproxy: true }));
		let body = document.getElementsByTagName("body")[0];
		if (body.classList.contains("light")) {
			body.classList.replace("light", theme.get({ noproxy: true }));
		} else {
			body.classList.replace("dark", theme.get({ noproxy: true }));
		}
	}, [theme.get({ noproxy: true })]);
	return { theme: theme.get({ noproxy: true }), setTheme: theme.set };
}

let hookStateStore = {
	currentPos: hookstate({ spaceId: "", topicId: "" }),
	authenticated: hookstate(false),
	myUserId: localStorage.getItem("myUserId"),
	token: localStorage.getItem("token"),
	theme: hookstate(localStorage.getItem("theme") ?? "dark"),
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
	authStep: hookstate("")
};

let initialId = "default";
let currentTabId = initialId;
export const getCurrentTabId = () => currentTabId;
export const updateCurrentTabId = (id: string) => { currentTabId = id; }

const pageToStateMap: { [path: string]: any } = {
	"homeDrawerOpen": () => hookstate(false)
}

const prepareNewStateStore = (): { [key: string]: { [key: string]: any } } => {
	let statesStore: { [key: string]: { [key: string]: any } } = {
		"main": { "homeDrawerOpen": pageToStateMap.homeDrawerOpen() }
	};
	return statesStore;
}

const statesOfEachPage: { [path: string]: string[] } = {
	"main": ["homeDrawerOpen"]
}

let appStateStore: { [key: string]: any } = {
	[initialId]: prepareNewStateStore()
};

export let States = {
	appStateStore,
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
	}
};

export let Actions = {
	updatePos: (spaceId: string, topicId: string) => {
		States.store.currentPos.set({ spaceId, topicId });
	},
	updateAuthStep: (v: string) => {
		States.store.authStep.set(v);
	},
	isAuthenticated: () => {
		return States.store.authenticated;
	},
	updateAuthenticated: (v: boolean) => {
		States.store.authenticated.set(v);
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
		let tabState = States.appStateStore[currentTabId];
		Object.keys(tabState).forEach(pageKey => {
			let pageState = tabState[pageKey];
			Object.keys(pageState).forEach(stateKey => {
				pageState[stateKey].set(v);
			});
		});
		Rx.notify("update-home-swiping-lock", { locked: v });
		Rx.notify("update-home-spaces-menu-pos", { pos: v ? (window.innerWidth - 72) : 0 });
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
	newTab: () => string,
	push: (p: string, state?: any) => void,
	pop: (options?: { doNotSlideBack: boolean }) => void,
	replaceData: (pc: number, la: string, h: { path: string, state: any, key: string }[]) => void
} = {
	_pathCount: 0,
	lastAction: "",
	swiperInst: null,
	history: hookstate<{ path: string, state: any, key: string }[]>([]),
	newTab: () => {
		let id = Math.random().toString().substring(2);
		let store = prepareNewStateStore();
		States.appStateStore[id] = store;
		currentTabId = id;
		return id;
	},
	push: (path: string, state?: any) => {
		let key = Math.random().toString().substring(2);
		let pageStateSetup = statesOfEachPage[path];
		if (pageStateSetup) {
			let stateDict: { [key: string]: any } = {};
			pageStateSetup.forEach(stateKey => {
				stateDict[stateKey] = pageToStateMap[stateKey]()
			});
			States.appStateStore[currentTabId][key] = stateDict;
		}
		RouteSys._pathCount++;
		RouteSys.lastAction = "navigate";
		RouteSys.history.set([...RouteSys.history.get({ noproxy: true }), { path, state, key }]);
	},
	pop: (options?: { doNotSlideBack: boolean }) => {
		let hist = RouteSys.history.get({ noproxy: true })
		let data = hist[hist.length - 1];
		delete States.appStateStore[currentTabId][data.key];
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
