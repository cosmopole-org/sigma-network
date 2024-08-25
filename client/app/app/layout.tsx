'use client'

import "@/styles/globals.css";
import { fontSans } from "@/config/fonts";
import { Providers } from "../providers";
import clsx from "clsx";
import { hookstate, useHookstate } from "@hookstate/core";
import { Card, CircularProgress, Spinner } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RouterComponent, RouteSys, showMainLoading, switchLoading, switchMainLoading, switchRoomLoading } from "../../api/offline/states";
import { loadSizes } from "@/api/offline/constants";
import 'swiper/css';
import 'swiper/css/effect-creative';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative } from 'swiper/modules';
import { switchHomeNav } from "@/components/home/home-navbar";
import { switchRoomNav } from "@/components/room/room-navbar";
import { useTheme } from "next-themes";
import { Logo } from "@/components/icons";
import IconButton from "@/components/elements/icon-button";
import { changeMetaDrawerState } from "@/components/home/metaTouch";
import { showRoomShadow } from "@/components/home/shadow";
import dynamic from "next/dynamic";

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
	RouteSys.swiperInst.slideNext();
}

export let switchMainDrawer = (open: boolean) => { }
export let setMainDrawerSwitcher = (mds: (open: boolean) => void) => {
	switchMainDrawer = mds;
}
export let mainDrawerOpen = hookstate(false);

export default function RootLayout({
	children,
	home,
	chat,
	call,
	profile,
	contacts,
	settings,
	chats,
}: Readonly<{
	children: React.ReactNode;
	home: React.ReactNode;
	chat: React.ReactNode;
	call: React.ReactNode;
	profile: React.ReactNode;
	contacts: React.ReactNode;
	settings: React.ReactNode;
	chats: React.ReactNode;
}>) {
	const mapOfRoutes: { [key: string]: any } = {
		"/app/home": home,
		"/app/chat": chat,
		"/app/call": call,
		"/app/profile": profile,
		"/app/contacts": contacts,
		"/app/settings": settings,
		"/app/chats": chats,
	};
	const mainDrawerOpenState = useHookstate(mainDrawerOpen);
	swipeNext = () => switchMainDrawer(false);
	const showRoom = useHookstate(showRoomShadow);
	const path = usePathname();
	if (path) dynamicPath = path;
	const scrollPositions = useRef<{ [url: string]: number }>({})
	loadSizes();
	const contentRef = useRef<HTMLDivElement>(null);
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

	const hist = useHookstate(RouteSys.history).get({ noproxy: true });
	useEffect(() => {
		if (RouteSys.swiperInst) {
			if (hist.length > 1) {
				RouteSys.swiperInst.allowTouchMove = true
			} else {
				RouteSys.swiperInst.allowTouchMove = false
			}
			RouteSys.swiperInst.slideNext();
		}
	}, [hist]);

	return (
		<main className="w-full h-full">
			<div ref={contentRef} className="w-full h-full fixed">
				<Swiper
					style={{
						width: '100%',
						height: '100%'
					}}
					effect="creative"
					creativeEffect={{
						prev: {
							shadow: true
						},
						next: {
							translate: ["100%", 0, 0]
						}
					}}
					modules={[EffectCreative]}
					touchStartPreventDefault={false}
					onSwiper={(s: any) => {
						RouteSys.putSwiper(s);
						RouteSys.swiperInst.update()
						RouteSys.swiperInst.on('slideChange', function (event: any) {
							if (event.activeIndex > event.previousIndex) {
								// do nothing
							} else {
								RouteSys.pop({ doNotSlideBack: true });
							}
						})
					}}
				>
					{hist.map((c, i) => <SwiperSlide key={c + "_" + i}>{mapOfRoutes[c]}</SwiperSlide>)}
				</Swiper>
			</div>
			<div style={{ zIndex: 99999 }} className="shadow-medium flex w-[calc(100%-32px)] h-9 left-4 top-3 bg-white dark:bg-background absolute rounded-3xl pl-1 pr-1">
				{
					showRoom.get({ noproxy: true }) ? (
						<IconButton name="close" className="ml-1 -mt-[2px]" onClick={() => {
							changeMetaDrawerState(false)
							showRoom.set(false)
						}} />
					) : hist[hist.length - 1] === "/app/profile" ? (
						<IconButton name="back" className="ml-1 -mt-[2px]" onClick={() => RouteSys.pop()} />
					) : hist[hist.length - 1] === "/app/contacts" ? (
						<IconButton name="back" className="ml-1 -mt-[2px]" onClick={() => RouteSys.pop()} />
					) : hist[hist.length - 1] === "/app/settings" ? (
						<IconButton name="back" className="ml-1 -mt-[2px]" onClick={() => RouteSys.pop()} />
					) : hist[hist.length - 1] === "/app/chats" ? (
						<IconButton name="back" className="ml-1 -mt-[2px]" onClick={() => RouteSys.pop()} />
					) : hist[hist.length - 1]  === "/app/call" ? (
						<IconButton name="back" className="ml-1 -mt-[2px]" onClick={() => RouteSys.pop()} />
					) : hist[hist.length - 1]  === "/app/chat" ? (
						<IconButton name="back" className="ml-1 -mt-[2px]" onClick={() => RouteSys.pop()} />
					) : mainDrawerOpenState.get({ noproxy: true }) ? (
						<IconButton name="close" className="ml-1 -mt-[2px]" onClick={() => switchMainDrawer(false)} />
					) : (
						<IconButton name="menu" className="ml-1 -mt-[2px]" onClick={() => switchMainDrawer(true)} />
					)
				}
				<IconButton color={'#006FEE'} name="connected" className="-mt-[2px]" />
				<div className="flex-1">
				</div>
				<div className="absolute left-1/2 -translate-x-1/2 pt-[7px] text-center">
					{showRoom.get({ noproxy: true }) ? "Chat" : "Keyhan's Home"}
				</div>
				<IconButton name="more" className="-mt-[2px]" />
			</div>
		</main>
	);
}
