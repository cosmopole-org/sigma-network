"use client"

import { setHomeCityScrollPos, setHomePeopleScrollPos, setHomeSettingsScrollPos } from "@/api/offline/backup";
import { RouteSys, showLoading } from "@/api/offline/states";
import { selectedHomeSection } from "@/components/home/home-bottomnav";
import { useHookstate } from "@hookstate/core";
import { Avatar, Card, Divider } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { getUsers } from "@/api/offline/constants";
import HomeRoomsList from "@/components/home/home-rooms-list";
import Icon from "@/components/elements/icon";
import HomeSettingsModal, { switchHomeSettingssModal } from "@/components/home/home-settings-modal";
import HomeContactsModal, { switchHomeContactsModal } from "@/components/home/home-contacts-modal";
import HomeChatsModal, { switchHomeChatsHomeModal } from "@/components/home/home-chats-modal";
import HomeInboxModal, { switchHomeInboxHomeModal } from "@/components/home/home-inbox-modal";

export default function HomePage() {
	const homeSectionState = useHookstate(selectedHomeSection);
	const showLoadingState = useHookstate(showLoading);
	const [panelId, setPanelId] = useState("topics");
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
	return (
		<div className="relative flex flex-col h-screen">
			<Card shadow="md" className="w-20 h-full bg-s-white dark:bg-content2 pl-2 pt-12 fixed overflow-y-auto" style={{ borderRadius: 0 }}>
				<div className="w-16 h-12 rounded-2xl mt-3 pl-5 pt-5"
					onClick={() => {
					}}>
					<Icon name="inbox" size={[24, 24]} color={"#777"} />
				</div>
				<Divider className="mt-6 w-[calc(100%-8px)] mb-2" />
				{
					getUsers().map(item => (
						<div
							onClick={() => {
								setPanelId("topics");
							}}
							key={item.id} className="w-12 h-12 bg-white dark: bg-content1 mt-6 ml-2" style={{ borderRadius: '50%' }}>
							<Avatar alt={item.name} className="w-full h-full" size="lg" src={item.avatar} isBordered />
						</div>
					))
				}
			</Card>
			<div className="fixed top-0 left-20 w-full h-full">
				<HomeRoomsList />
			</div>
            <HomeSettingsModal />
            <HomeContactsModal />
            <HomeChatsModal />
			<HomeInboxModal />
		</div>
	);
}
