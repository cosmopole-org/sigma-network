"use client"

import { setHomeCityScrollPos, setHomePeopleScrollPos, setHomeSettingsScrollPos } from "@/api/offline/backup";
import RoomBottomNav, { selectedRoomSection } from "@/components/room/room-bottomnav";
import { useHookstate } from "@hookstate/core";
import { Card, CircularProgress } from "@nextui-org/react";
import { useEffect } from "react";
import { roomSliderView, showRoomLoading } from '../../../api/offline/states';

export default function RoomLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const roomSectionState = useHookstate(selectedRoomSection);
	const showLoadingState = useHookstate(showRoomLoading);
	const open = useHookstate(roomSliderView);
	useEffect(() => {
		const scroller = () => {
			switch (roomSectionState.get({ noproxy: true })) {
				case 'board': {
					setHomePeopleScrollPos(document.documentElement.scrollTop);
					break;
				}
				case 'chat': {
					setHomeCityScrollPos(document.documentElement.scrollTop);
					break;
				}
				case 'files': {
					setHomeSettingsScrollPos(document.documentElement.scrollTop);
					break;
				}
			}
		}
		if (typeof window !== 'undefined') {
			window.addEventListener('scroll', scroller);
		}
		open.set(true);
		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('scroll', scroller);
			}
		}
	}, []);
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
				<RoomBottomNav />
			</main>
		</div>
	);
}
