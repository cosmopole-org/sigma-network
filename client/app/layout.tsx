'use client'

import "@/styles/globals.css";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import clsx from "clsx";
import { useHookstate } from "@hookstate/core";
import { Card, CircularProgress } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { showMainLoading, switchLoading, switchMainLoading, switchRoomLoading } from "../api/offline/states";
import { getUsers, loadSizes } from "@/api/offline/constants";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-creative';
import { switchHomeNav } from "@/components/home/home-navbar";
import { switchRoomNav } from "@/components/room/room-navbar";
import { useTheme } from "next-themes";
import { Logo } from "@/components/icons";
import IconButton from "@/components/elements/icon-button";
import MetaTouch, { changeMetaDrawerState } from "@/components/home/metaTouch";
import { showRoomShadow } from "@/components/home/shadow";

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

let dynamicPath = '';

let oldPath = '';
let oldScroll = 0;
let swiperInst: any = null;
export const enableSwiper = () => {
	if (swiperInst) {
		swiperInst.enable();
	}
}
export const disableSwiper = () => {
	if (swiperInst) {
		swiperInst.disable();
	}
}
export const swipePrev = () => {
	if (swiperInst) {
		swiperInst.slidePrev();
	}
}
export const swipeNext = () => {
	if (swiperInst) {
		swiperInst.slideNext();
	}
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const showRoom = useHookstate(showRoomShadow);
	const path = usePathname();
	if (path) dynamicPath = path;
	const scrollPositions = useRef<{ [url: string]: number }>({})
	loadSizes();
	const contentRef = useRef<HTMLDivElement>(null);
	const [loaded, setLoaded] = useState(false);
	useEffect(() => {
		setLoaded(true);
	}, []);
	useEffect(() => {
		const scroller = () => {
			if (contentRef.current) {
				console.log(dynamicPath, contentRef.current.scrollTop);
				if (dynamicPath.startsWith('/app/home')) {
					if (oldScroll > contentRef.current.scrollTop) {
						switchHomeNav(true)
					} else if (oldScroll < contentRef.current.scrollTop) {
						switchHomeNav(false);
					}
				} else if (dynamicPath.startsWith('/app/room')) {
					if (oldScroll > contentRef.current.scrollTop) {
						switchRoomNav(true)
					} else if (oldScroll < contentRef.current.scrollTop) {
						switchRoomNav(false);
					}
				}
				oldScroll = contentRef.current.scrollTop;
			}
		}
		if (loaded) {
			contentRef.current?.addEventListener('scroll', scroller);
		}
		handleResize()
		loadTheme()
		window.addEventListener('resize', handleResize)
		return () => {
			contentRef.current?.removeEventListener('scroll', scroller);
			window.removeEventListener('resize', handleResize);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loaded])
	useEffect(() => {
		if (contentRef.current) {
			if (oldPath !== dynamicPath) {
				scrollPositions.current[oldPath] = oldScroll;
				oldPath = dynamicPath
				oldScroll = 0
			}
			contentRef.current.scroll({
				top: scrollPositions.current[dynamicPath],
				behavior: "auto",
			})
		}
		switchLoading(false);
		switchRoomLoading(false);
		switchMainLoading(false);
		if (dynamicPath.startsWith("/app/home")) {
			switchHomeNav(true);
		} else if (dynamicPath.startsWith("/app/room")) {
			switchRoomNav(true);
		}
	}, [path])
	const showLoadingState = useHookstate(showMainLoading);
	const [h, setH] = useState(0)
	const handleResize = () => setH(window.innerHeight);
	const { theme } = useTheme();
	const loadTheme = () => {
		if (typeof window !== 'undefined') {
			const m = document.querySelector('meta[name="theme-color"]');
			if (m) m.setAttribute('content', theme === 'light' ? '#ffffff' : '#172024');
		}
	}
	useEffect(() => {
		loadTheme()
	}, [theme]);
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<title>Sigma</title>
				<meta name='description' content='Welcome to Sigma universe!' />
				<meta name="theme-color" content={theme === 'light' ? '#ffffff' : '#172024'} />
				<link rel="manifest" href="/manifest.json" />
			</head>
			<body
				className={clsx(
					"bg-background font-sans antialiased",
					fontSans.variable
				)}
			>
				<Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
					{
						loaded ? (
							<div className="relative flex flex-col" style={{ height: h }}>
								<main className="w-full h-full">
									<div className="w-full h-full overflow-hidden">
										<div ref={contentRef} className="w-full h-full overflow-hidden relative">
											{children}
										</div>
										<div style={{ zIndex: 99999 }} className="shadow-medium flex w-[calc(100%-32px)] h-9 left-4 top-3 bg-white dark:bg-background absolute rounded-3xl pl-1 pr-1">
											{
												showRoom.get({ noproxy: true }) ? (
													<IconButton color={'#000'} name="close" className="ml-1 -mt-[2px]" onClick={() => {
														changeMetaDrawerState(false)
														showRoom.set(false)
													}} />
												) : (
													<IconButton color={'#000'} name="menu" className="ml-1 -mt-[2px]" onClick={() => swipePrev()} />
												)
											}
											<IconButton color={'#006FEE'} name="connected" className="-mt-[2px]" />
											<div className="flex-1">
											</div>
											<div className="absolute left-1/2 -translate-x-1/2 pt-[7px] text-center">
												{showRoom.get({ noproxy: true }) ? "Chat" : "Keyhan's Home"}
											</div>
											<IconButton color={'#000'} name="more" className="-mt-[2px]" />
										</div>
									</div>
									{
										showLoadingState.get({ noproxy: true }) ? (
											<Card isBlurred shadow="none" radius="none" className="w-full h-full fixed left-0 top-0 bg-transparent" style={{ zIndex: 100 }}>
												<Card className="w-24 h-24 fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
													<CircularProgress />
												</Card>
											</Card>
										) : null
									}
								</main>
							</div>
						) : (
							<div className="relative flex flex-col" style={{ height: h }}>
								<main className="w-full h-full">
									<Logo size={88} className="fixed left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4" />
								</main>
							</div>
						)
					}
				</Providers>
			</body>
		</html >
	);
}
