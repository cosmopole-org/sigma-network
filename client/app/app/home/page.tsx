"use client"

import { setHomeCityScrollPos, setHomePeopleScrollPos, setHomeSettingsScrollPos } from "@/api/offline/backup";
import { showLoading } from "@/api/offline/states";
import HomeBottomNav, { selectedHomeSection } from "@/components/home/home-bottomnav";
import { useHookstate } from "@hookstate/core";
import { Card, CircularProgress } from "@nextui-org/react";
import React, { useEffect } from "react";
import Contacts from "./contacts/page";
import Settings from "./settings/page";
import Spaces from "./spaces/page";

export default function HomePage() {
	const homeSectionState = useHookstate(selectedHomeSection);
	const showLoadingState = useHookstate(showLoading);
	useEffect(() => {
		const scroller = () => {
			switch (homeSectionState.get({ noproxy: true })) {
				case 'contacts': {
					setHomePeopleScrollPos(document.documentElement.scrollTop);
					break;
				}
				case 'spaces': {
					setHomeCityScrollPos(document.documentElement.scrollTop);
					break;
				}
				case 'settings': {
					setHomeSettingsScrollPos(document.documentElement.scrollTop);
					break;
				}
			}
		}
		if (typeof window !== 'undefined') {
			window.addEventListener('scroll', scroller);
		}
		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('scroll', scroller);
			}
		}
	}, []);
	let children: React.ReactNode;
	switch (homeSectionState.get({ noproxy: true })) {
		case 'contacts': {
			children = <Contacts />
			break;
		}
		case 'spaces': {
			children = <Spaces />
			break;
		}
		case 'settings': {
			children = <Settings />
			break;
		}
		default: {
			children = null
		}
	}
	return (
		<div className="relative flex flex-col h-screen">
			<main className="w-full h-full relative">
				{children}
				{
					showLoadingState.get({ noproxy: true }) ? (
						<Card shadow="none" radius="none" className="w-full h-full fixed left-0 top-0" style={{ zIndex: 50 }}>
							<Card className="w-24 h-24 fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
								<CircularProgress />
							</Card>
						</Card>
					) : null
				}
				<HomeBottomNav />
			</main>
		</div>
	);
}
