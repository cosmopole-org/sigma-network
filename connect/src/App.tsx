import "@/styles/globals.css";
import { useHookstate } from "@hookstate/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentTabId, RouteSys, States, updateCurrentTabId, useTheme } from "./api/client/states";
import { loadSizes } from "@/api/client/constants";
import 'swiper/css';
import 'swiper/css/effect-creative';
import MainSwiper from "./components/components/main-swiper";
import HomeMain from "./app/home/page";
import ChatPage from "./app/chat/page";
import CallPage from "./app/call/page";
import ProfilePage from "./app/profile/page";
import ContactsPage from "./app/contacts/page";
import SettingsPage from "./app/settings/page";
import ChatsPage from "./app/chats/page";
import ExplorePage from "./app/explore/page";
import RoomMachinesPage from "./app/room-machines/page";
import StatusBar from "./components/components/status-bar";
import AuthPage from "./app/auth/page";
import SplashPage from "./app/splash/page";
import CreateSpaceModal from "./components/modals/create-space/page";
import CreateTopicModal from "./components/modals/create-topic/page";
import html2canvas from "html2canvas";
import { Button } from "@nextui-org/button";
import Icon from "./components/elements/icon";
import { Cache } from "html2canvas/dist/types/core/cache-storage";

if (typeof window !== 'undefined') {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js')
			.then(registration => {
				console.log('Service Worker registered with scope:', registration.scope);
			})
			.catch(error => {
				console.error('Service Worker registration failed:', error);
			});
	});
}

export const mapOfRoutes: { [key: string]: any } = {
	// pages
	"/app/splash": SplashPage,
	"/app/auth": AuthPage,
	"/app/home": HomeMain,
	"/app/chat": ChatPage,
	"/app/call": CallPage,
	"/app/profile": ProfilePage,
	"/app/contacts": ContactsPage,
	"/app/settings": SettingsPage,
	"/app/chats": ChatsPage,
	"/app/explore": ExplorePage,
	"/app/room-machines": RoomMachinesPage,
	// modals
	"/app/create-space": CreateSpaceModal,
	"/app/create-topic": CreateTopicModal,
};

const Container = (props: { type: string, state: any }) => {
	const Comp = mapOfRoutes[props.type];
	const memoCompVal = useMemo(() => <Comp {...props.state} />, []);
	if (!Comp) return null;
	return memoCompVal;
}

export default function Main() {
	const [, setUpddateTrigger] = useState(Math.random());
	const [preAuthStepChange, setPreAuthStepChange] = useState("");
	useTheme();
	const top1CompCache = useRef<any>(null);
	const top2CompCache = useRef<any>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const authStep = States.useListenerByKey("authStep");
	const hist = useHookstate(RouteSys.history).get({ noproxy: true });

	const opacityRef = useRef<HTMLDivElement>(null);
	const ssStore = useRef<{ [id: string]: { element: any, snapshot: any } }>({});
	const screenshotRef = useRef<HTMLDivElement>(null);
	const [key, setKey] = useState(Math.random());
	const currentTabIdRef = useRef("");

	loadSizes();

	const memHome = useMemo(() => <HomeMain />, []);

	useEffect(() => {

		if (top1CompCache.current) {
			if (RouteSys.lastAction === "navigate") {
				if (hist.length > 1) {
					let Top1 = mapOfRoutes[hist[hist.length - 1]?.path];
					top2CompCache.current = top1CompCache.current;
					top1CompCache.current = <Top1 />;
				}
			} else if (RouteSys.lastAction === "back") {
				top1CompCache.current = top2CompCache.current;
				if (hist.length > 1) {
					let Top2 = mapOfRoutes[hist[hist.length - 2]?.path];
					top2CompCache.current = (
						<Top2 />
					);
				} else {
					top2CompCache.current = null;
				}
			}
		} else {
			let Top1 = mapOfRoutes[hist[hist.length - 1]?.path];
			top1CompCache.current = (
				<Top1 />
			);
		}

		setUpddateTrigger(Math.random());

	}, [hist]);

	let content = null;

	switch (preAuthStepChange) {
		case "passed": {
			content = (
				<div ref={contentRef} className="w-full h-full fixed">
					{memHome}
					<MainSwiper
						onOpen={() => {

						}}
						onClose={() => {
							setTimeout(() => {
								RouteSys.pop({ doNotSlideBack: true });
							}, 250);
						}}
						contentKey={hist[hist.length - 1]?.path}
						bottomKey={hist[hist.length - 2]?.path}
						content={<Container type={hist[hist.length - 1]?.path} state={hist[hist.length - 1]?.state} />}
						bottom={<Container type={hist[hist.length - 2]?.path} state={hist[hist.length - 2]?.state} />}
					/>
				</div>
			);
			break;
		}
		case "auth": {
			content = <AuthPage />;
			break;
		}
		default: {
			content = <SplashPage />;
			break;
		}
	}

	const shadowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (shadowRef.current) {
			if (authStep !== "") {
				shadowRef.current.style.opacity = "0";
				setTimeout(() => {
					setPreAuthStepChange(authStep);
					setTimeout(() => {
						if (shadowRef.current) {
							shadowRef.current.style.opacity = "1";
						}
					}, 250);
				}, 250);
			}
		}
	}, [authStep]);

	let w = window.innerWidth / 2 - 16;
	let h = w * window.innerHeight / window.innerWidth;

	const createNewTab = (id: string) => {
		let placeholder = document.createElement("div");
		placeholder.setAttribute("id", id);
		placeholder.style.width = '100%';
		placeholder.style.height = (h + 'px').toString();
		placeholder.style.borderRadius = '16px 16px 16px 16px';
		placeholder.style.backgroundColor = '#ffffff';
		screenshotRef.current?.appendChild(placeholder);
		ssStore.current[id] = { element: placeholder, snapshot: { states: { ...States.store }, pc: RouteSys._pathCount, la: RouteSys.lastAction, h: RouteSys.history.get({ noproxy: true }) } };
		currentTabIdRef.current = id;
		return { el: placeholder };
	}

	const takeScreenshot = (el: any, isNew: boolean) => {
		if (shadowRef.current && opacityRef.current) {
			let id = currentTabIdRef.current
			let canvasPromise = html2canvas(shadowRef.current, {
				width: !isNew ? (w + 16) : window.innerWidth,
				height: !isNew ? (h + 32) : window.innerHeight,
				imageTimeout: 1,
				foreignObjectRendering: false
			});
			canvasPromise.then((canvas) => {
				canvas.setAttribute("id", id);
				canvas.style.width = '100%';
				canvas.style.height = (h + 'px').toString();
				canvas.style.borderRadius = '16px 16px 16px 16px';
				ssStore.current[id].element = canvas;
				canvas.onclick = () => {
					if (shadowRef.current && opacityRef.current) {
						if (currentTabIdRef.current !== "") {
							ssStore.current[currentTabIdRef.current].snapshot = { states: { ...States.store }, pc: RouteSys._pathCount, la: RouteSys.lastAction, h: RouteSys.history.get({ noproxy: true }) };
						}
						shadowRef.current.style.display = 'block';
						opacityRef.current.style.opacity = '1';
						shadowRef.current.style.transform = 'scale(1.0)';
						currentTabIdRef.current = id;
						updateCurrentTabId(id);
						let snapshot = ssStore.current[id].snapshot;
						RouteSys.replaceData(
							snapshot.pc,
							snapshot.la,
							snapshot.h,
						);
						setKey(Math.random());
					}
					setTimeout(() => {
						if (screenshotRef.current) {
							screenshotRef.current.style.display = 'none';
						}
					});
				};
				el.replaceWith(canvas);
			});
		}
	}

	return (
		<main className="w-full h-screen">
			<div ref={opacityRef} className="w-full h-full" style={{ opacity: 1, transition: 'opacity 0.25s' }}>
				<div key={key} ref={shadowRef} className="w-full h-full" style={{ transform: 'scale(1)', transition: 'transform 0.25s' }}>
					{content}
				</div>
			</div>
			<div ref={screenshotRef}
				style={{ display: 'none', alignItems: 'flex-start', overflowY: 'auto' }}
				className="p-4 pt-16 w-full h-full fixed gap-4 grid-cols-2 left-0 top-0 bg-white dark:bg-content1"
			>
				<Button isIconOnly className="w-full" style={{ height: h }} onClick={() => {
					let id = RouteSys.newTab();
					let { el } = createNewTab(id);
					currentTabIdRef.current = id;
					if (shadowRef.current) {
						shadowRef.current.style.display = 'block';
					}
					if (shadowRef.current && opacityRef.current) {
						opacityRef.current.style.opacity = '1';
						shadowRef.current.style.transform = 'scale(1.0)';
					}
					setTimeout(() => {
						if (screenshotRef.current) {
							screenshotRef.current.style.display = 'none';
						}
						setTimeout(() => {
							takeScreenshot(el, true);
						});
					});
				}}>
					<Icon name="add" />
				</Button>
			</div>
			<StatusBar screenshotCallback={() => {
				if (screenshotRef.current) {
					if (shadowRef.current && opacityRef.current) {
						if (shadowRef.current.style.transform === "scale(1)") {
							let el: any = null;
							if (Object.keys(ssStore.current).length === 0) {
								let id = "default";
								({ el } = createNewTab(id));
							} else {
								if (currentTabIdRef.current !== "") {
									el = document.getElementById(currentTabIdRef.current);
								}
							}
							shadowRef.current.style.transform = 'scale(0.5)';
							opacityRef.current.style.opacity = '0';
							setTimeout(() => {
								if (shadowRef.current) {
									if (screenshotRef.current) {
										screenshotRef.current.style.display = 'grid';
									}
									shadowRef.current.style.display = 'hidden';
								}
								takeScreenshot(el, false);
							}, 250);
						} else {
							if (shadowRef.current) {
								shadowRef.current.style.display = 'block';
							}
							opacityRef.current.style.opacity = '1';
							shadowRef.current.style.transform = 'scale(1.0)';
							setTimeout(() => {
								if (screenshotRef.current) {
									screenshotRef.current.style.display = 'none';
								}
							});
						}
					}
				}
			}} />
		</main >
	);
}
