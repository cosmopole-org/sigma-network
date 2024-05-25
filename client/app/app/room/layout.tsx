"use client"

import RoomBottomNav from "@/components/room/room-bottomnav";
import { useHookstate } from "@hookstate/core";
import { Card, Spinner } from "@nextui-org/react";
import { useState } from "react";
import { showRoomLoading } from '../../../api/offline/states';
import { useRouter } from "next/navigation";
import Main from "../../../components/room/room-main";

export default function RoomLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const showLoadingState = useHookstate(showRoomLoading);
	const [panelKey, setPanelKey] = useState<string | undefined>(undefined)
	const router = useRouter();
	return (
		<div className="relative flex flex-col h-screen w-screen">
			<main className="w-full h-full relative">
				<Main />
				{panelKey ? (
					<div
						className="w-full h-full fixed top-0 left-0 bg-s-black/60 z-50"
						onClick={() => {
							setPanelKey(undefined)
							router.replace('/app/room');
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
					if (!pk) {
						router.replace('/app/room');
					}
					setPanelKey(pk)
				}} />
			</main>
		</div>
	);
}
