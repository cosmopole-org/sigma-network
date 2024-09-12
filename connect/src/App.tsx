import "@/styles/globals.css";
import { useHookstate } from "@hookstate/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { RouteSys, States, useTheme } from "./api/offline/states";
import { loadSizes } from "@/api/offline/constants";
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
	"/app/room-machines": RoomMachinesPage
};

const Container = (props: { type: string }) => {
	const Comp = mapOfRoutes[props.type];
	const memoCompVal = useMemo(() => <Comp />, []);
	if (!Comp) return null;
	return memoCompVal;
}

export default function Main() {
	const [, setUpddateTrigger] = useState(Math.random());
    useTheme();
	const top1CompCache = useRef<any>(null);
	const top2CompCache = useRef<any>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const isAuthenticated = States.useListener(States.store.authenticated);
	const hist = useHookstate(RouteSys.history).get({ noproxy: true });

	loadSizes();

	const memHome = useMemo(() => <HomeMain />, []);

	useEffect(() => {

		if (top1CompCache.current) {
			if (RouteSys.lastAction === "navigate") {
				if (hist.length > 1) {
					let Top1 = mapOfRoutes[hist[hist.length - 1]];
					top2CompCache.current = top1CompCache.current;
					top1CompCache.current = <Top1 />;
				}
			} else if (RouteSys.lastAction === "back") {
				top1CompCache.current = top2CompCache.current;
				if (hist.length > 1) {
					let Top2 = mapOfRoutes[hist[hist.length - 2]];
					top2CompCache.current = (
						<Top2 />
					);
				} else {
					top2CompCache.current = null;
				}
			}
		} else {
			let Top1 = mapOfRoutes[hist[hist.length - 1]];
			top1CompCache.current = (
				<Top1 />
			);
		}

		setUpddateTrigger(Math.random());

	}, [hist]);

	return (
		<main className="w-full h-screen">
			{
				(isAuthenticated || (hist[hist.length - 1] === "/app/auth")) ? (
					<div ref={contentRef} className="w-full h-full fixed">
						{isAuthenticated ? memHome : null}
						<MainSwiper
							onOpen={() => {

							}}
							onClose={() => {
								setTimeout(() => {
									RouteSys.pop({ doNotSlideBack: true });
								}, 250);
							}}
							contentKey={hist[hist.length - 1]}
							bottomKey={hist[hist.length - 2]}
							content={<Container type={hist[hist.length - 1]} />}
							bottom={<Container type={hist[hist.length - 2]} />}
						/>
					</div>
				) :
					<SplashPage />
			}
			<StatusBar />
		</main >
	);
}
