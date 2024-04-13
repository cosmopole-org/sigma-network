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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const path = usePathname();
	dynamicPath = path;
	const scrollPositions = useRef<{ [url: string]: number }>({})
	loadSizes();
	const contentRef = useRef<HTMLDivElement>(null);
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
		contentRef.current?.addEventListener('scroll', scroller);
		return () => {
			contentRef.current?.removeEventListener('scroll', scroller);
		}
	}, [])
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
		handleResize()
		loadTheme()
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		loadTheme()
	}, [theme]);
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="theme-color" content={theme === 'light' ? '#ffffff' : '#172024'} />
			</head>
			<body
				className={clsx(
					"bg-background font-sans antialiased",
					fontSans.variable
				)}
			>
				<Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
					<div className="relative flex flex-col" style={{ height: h }}>
						<main className="w-full h-full">
							<Swiper
								onInit={(swiper: any) => {
									swiperInst = swiper
								}}
								grabCursor={true}
								effect={'creative'}
								creativeEffect={{
									prev: {
										shadow: true,
										translate: [0, 0, -100],
									},
									next: {
										translate: ['100%', 0, 0],
									},
								}}
								modules={[EffectCreative]}
								className="h-full w-full"
							>
								<SwiperSlide className="w-full h-full"><div ref={contentRef} className="w-full h-full overflow-x-hidden overflow-y-auto">{children}</div></SwiperSlide>
								<SwiperSlide className="w-full h-full">
									<div className="grid grid-cols-2 w-full h-full overflow-auto p-4 gap-2 bg-s-white/70 dark:bg-black/70">
										{getUsers().map(i => (
											<div key={i.id} className="w-full h-48 bg-white dark:bg-s-black rounded-lg">

											</div>
										))}
									</div>
								</SwiperSlide>
							</Swiper>
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
				</Providers>
			</body>
		</html>
	);
}
