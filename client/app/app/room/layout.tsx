"use client"

import { setHomeCityScrollPos, setHomePeopleScrollPos, setHomeSettingsScrollPos } from "@/api/offline/backup";
import RoomBottomNav from "@/components/room/room-bottomnav";
import { useHookstate } from "@hookstate/core";
import { Card, Spinner } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { roomSliderView, showRoomLoading } from '../../../api/offline/states';
import Board from "./board/page";

export default function RoomLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const showLoadingState = useHookstate(showRoomLoading);
	const [panelKey, setPanelKey] = useState<string | undefined>(undefined)
	return (
		<div className="relative flex flex-col h-screen w-screen">
			<main className="w-full h-full relative">
				<Board />
				{panelKey ? (
					<div
						className="w-full h-full fixed top-0 left-0 bg-s-black/60 z-50"
						onClick={(e) => {
							setPanelKey(undefined)
						}} />
				) : null}
				<div className={"z-50 w-full h-[calc(100vh-168px)] fixed top-[100%] dark:bg-s-black-2 bg-s-white"}
					style={{
						transform: panelKey ? "translateY(calc(168px - 100vh))" : "translateY(0px)",
						transition: 'transform 250ms'
					}}
				>
					{children}
					{
						showLoadingState.get({ noproxy: true }) ? (
							<Card shadow="none" radius="none" className="w-full h-full fixed left-0 top-0" style={{ zIndex: 50 }}>
								<Card className="w-24 h-24 fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
									<Spinner />
								</Card>
							</Card>
						) : null
					}
				</div>
				<RoomBottomNav panelKey={panelKey} openPanel={(pk: string) => {
					setPanelKey(pk)
				}} />
			</main>
		</div>
	);
}
