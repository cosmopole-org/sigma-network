import "@/styles/globals.css";
import { useHookstate } from "@hookstate/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { Actions, RouteSys, States, useTheme } from "./api/client/states";
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
import MembersPage from "./app/members/page";
import { Card } from "@nextui-org/react";
import Loading from "./components/components/Loading";
import LoadingOverlay from "./components/components/loading-overlay";
import AppletTabs from "./components/components/applet-tabs";

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
	"/app/members": MembersPage,
	"/app/settings": SettingsPage,
	"/app/chats": ChatsPage,
	"/app/explore": ExplorePage,
	"/app/room-machines": RoomMachinesPage,
	// modals
	"/app/create-space": CreateSpaceModal,
	"/app/create-topic": CreateTopicModal,
};
let framesStorage: { [id: string]: number } = {};

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

	const [frameLoaded, setFrameLoaded] = useState(false);

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

	const appletShown = States.useListener(States.store.appletShown);
	const shadowRef = useRef<HTMLDivElement>(null);
	const full = States.useListener(States.store.appletFull);

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

	useEffect(() => {
		let w = window as any;
		w.minmizeAppletSheet = () => {
			let frameEl = document.getElementById("frames");
			for (let id in framesStorage) {
				let el = document.getElementById(id);
				if (el) el.slot = "frameStore";
			}
			if (frameEl) frameEl.style.transform = 'translate(0px, 100%)';
		}
		w.closeTab = (id: string) => {
			delete framesStorage[id];
		}
		w.closeAppletSheet = (id: string) => {
			delete framesStorage[id];
			let el = document.getElementById(id);
			if (el) el.remove();
			w.minmizeAppletSheet();
		}
		w.prepareFrame = (identifier: string, url: string) => {
			let frameEl = document.getElementById("frames");
			let framesListEl = document.getElementById("framesList");
			if (!framesStorage[identifier]) {
				setFrameLoaded(false);
				framesStorage[identifier] = 1;
				let f = document.createElement("iframe");
				f.id = identifier;
				f.slot = "frameStore";
				f.frameBorder = "0";
				f.width = '100%';
				f.height = '100%';
				f.src = url.startsWith('https://') ? url : `https://gate.kproto.app:8443/${url}`;
				if (framesListEl) framesListEl.appendChild(f);
			}
			for (let id in framesStorage) {
				if (id !== identifier) {
					let el = document.getElementById(id);
					if (el) el.slot = "frameStore";
				}
			}
			let el = document.getElementById(identifier);
			if (el) {
				el.onload = () => {
					framesStorage[identifier] = 2;
					setFrameLoaded(true);
					el.slot = "frameStage";
				}
				if (framesStorage[identifier] === 2) {
					setFrameLoaded(true);
					el.slot = "frameStage";
				}
			}
			if (frameEl) frameEl.style.transform = 'translate(0px, 0%)';
		}
		setTimeout(() => {
			w.loadSlots();
		});
	}, []);
	const showTabs = States.useListener(States.store.showAppletTabs);
	const [viewTabs, setViewTabs] = useState(false);
	useEffect(() => {
		if (showTabs) {
			setViewTabs(true);
		} else {
			setTimeout(() => {
				setViewTabs(false);
			}, 250);
		}
	}, [showTabs]);

	return (
		<main className="w-full h-screen">
			<div ref={opacityRef} className="w-full h-full" style={{ opacity: 1, transition: 'opacity 0.25s', overflow: 'hidden' }}>
				<div ref={shadowRef} className="w-full h-full" style={{ transform: 'scale(1)', transition: 'transform 0.25s' }}>
					{content}
				</div>
			</div>
			{
				(appletShown || showTabs) ? (
					<div className="w-full h-full absolute left-0 top-0" style={{ backdropFilter: 'blur(10px)' }} />
				) : null
			}
			<div id="frames" className="w-full h-full absolute left-0 bottom-0" style={{ zIndex: 1, transform: 'translate(0px, 100%)', transition: 'transform 250ms, height 250ms' }}>
				<div onClick={() => {
					let currentAppletData = States.store.currentAppletData.get({ noproxy: true });
					Actions.switchAppletLoaded(false)
					Actions.switchAppletShown(false)
					if (currentAppletData) {
						let appletId = currentAppletData.id;
						Actions.closeApplet(appletId);
						(window as any).closeAppletSheet('safezone-desktop-sheet-' + appletId);
					}
				}} className="w-full h-full relative">
					<div id={'sheet-holder'} className={"w-full " + " absolute left-0 bottom-0 " + (viewTabs ? "" : "bg-content3")} style={{ borderRadius: (viewTabs || full) ? "" : '24px 24px 0px 0px', height: (full || viewTabs) ? `100%` : `85%`, paddingTop: (full && !viewTabs) ? 60 : 0, transition: 'height 250ms' }}>
						{(viewTabs || full) ? null : (
							<div style={{ width: '100%', position: 'relative', height: 28 }}>
								{full ? null : <Card style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 100, height: 6, borderRadius: 3, top: 12 }} className='bg-primary' />}
							</div>
						)}
						{
							(viewTabs || frameLoaded) ? null : (
								<div style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 }}>
									<div style={{ width: '100%', height: '100%', position: 'relative' }}>
										<Loading isWidget={false} overlay={false} key={'safezone-loading-iframes'} onCancel={() => {
											let currentAppletData = States.store.currentAppletData.get({ noproxy: true });
											Actions.switchAppletLoaded(false)
											Actions.switchAppletShown(false)
											if (currentAppletData) {
												let appletId = currentAppletData.id;
												Actions.closeApplet(appletId);
												(window as any).closeAppletSheet('safezone-desktop-sheet-' + appletId);
											}
										}} />
									</div>
								</div>
							)
						}
						<div id="framesList" className={"w-full h-full"} style={{ paddingBottom: full ? 0 : 28 }} />
					</div>
				</div>
			</div>
			<AppletTabs />
			<LoadingOverlay />
			<StatusBar screenshotCallback={() => { }} />
		</main >
	);
}
