'use client'

import "@/styles/globals.css";
import { hookstate, useHookstate } from "@hookstate/core";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { mainDrawerOpen, RouterComponent, RouteSys, showMainLoading, switchLoading, switchMainDrawer, switchMainLoading, switchRoomLoading } from "../../api/offline/states";
import { loadSizes } from "@/api/offline/constants";
import 'swiper/css';
import 'swiper/css/effect-creative';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { EffectCreative, Virtual } from 'swiper/modules';
import { switchHomeNav } from "@/components/home/home-navbar";
import { switchRoomNav } from "@/components/room/room-navbar";
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

const mapOfRoutes: { [key: string]: any } = {
	"/app/home": dynamic(() => import("./home/page")),
	"/app/chat": dynamic(() => import("./chat/page")),
	"/app/call": dynamic(() => import("./call/page")),
	"/app/profile": dynamic(() => import("./profile/page")),
	"/app/contacts": dynamic(() => import("./contacts/page")),
	"/app/settings": dynamic(() => import("./settings/page")),
	"/app/chats": dynamic(() => import("./chats/page")),
};

export default function Main() {
	const mainDrawerOpenState = useHookstate(mainDrawerOpen);
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

	let hist = useHookstate(RouteSys.history).get({ noproxy: true });
	useEffect(() => {
		if (RouteSys.swiperInst) {
			if (hist.length > 1) {
				RouteSys.swiperInst.allowTouchMove = true
			} else {
				RouteSys.swiperInst.allowTouchMove = false
			}
			if (RouteSys.lastAction === "navigate") {
				setTimeout(() => {
					RouteSys.swiperInst.slideNext();
				});
			}
		}
	}, [hist]);

	return (
		<main className="w-full h-full">
			<div ref={contentRef} className="w-full h-full fixed">
				<Swiper
					virtual
					style={{
						width: '100%',
						height: '100%'
					}}
					modules={[Virtual]}
					touchStartPreventDefault={false}
					onSwiper={(s: SwiperClass) => {
						RouteSys.putSwiper(s);
						s.update()
						s.on('slideChange', function (event: any) {
							if (event.activeIndex > event.previousIndex) {
								// do nothing
							} else {
								RouteSys.pop({ doNotSlideBack: true });
							}
						})
					}}
				>
					{hist.map((c, i) => <SwiperSlide className="w-full h-full bg-white dark:bg-content1" key={c + "_" + i}>{mapOfRoutes[c]}</SwiperSlide>)}
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
					) : hist[hist.length - 1] === "/app/call" ? (
						<IconButton name="back" className="ml-1 -mt-[2px]" onClick={() => RouteSys.pop()} />
					) : hist[hist.length - 1] === "/app/chat" ? (
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
