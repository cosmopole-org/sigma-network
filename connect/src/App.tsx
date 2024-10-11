import "@/styles/globals.css";
import { useHookstate } from "@hookstate/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { RouteSys, States, useTheme } from "./api/client/states";
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

	return (
		<main className="w-full h-screen">
			<div ref={opacityRef} className="w-full h-full" style={{ opacity: 1, transition: 'opacity 0.25s' }}>
				<div ref={shadowRef} className="w-full h-full" style={{ transform: 'scale(1)', transition: 'transform 0.25s' }}>
					{content}
				</div>
			</div>
			<StatusBar screenshotCallback={() => {}} />
		</main >
	);
}
