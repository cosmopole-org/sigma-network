import { Avatar, Card, Divider } from "@nextui-org/react";
import HomeRoomsList from "@/components/home/home-rooms-list";
import Icon from "@/components/elements/icon";
import HomeInboxModal from "@/components/home/home-inbox-modal";
import { Actions } from "@/api/client/states";
import { getUsers } from "@/api/client/constants";
import { useEffect, useState } from "react";
import { api } from "@/index";
import { Space } from "@/api/sigma/models";

export default function HomePage() {
	const [selectedSpaceId, setSelectedSpaceId] = useState("");
	const [spaces, setSpaces] = useState<Space[]>([]);
	useEffect(() => {
		const spacesObservable = api.sigma.store.db.spaces.find().$;
		let spacesSub = spacesObservable.subscribe(ss => {
			if (selectedSpaceId === "") {
				setSelectedSpaceId(ss.length > 0 ? (ss[0] as any).id : "");
			}
			setSpaces(ss);
		});
		return () => {
			spacesSub.unsubscribe();
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
				<div className="w-16 h-12 rounded-2xl mt-3 pl-5 pt-5"
					onClick={() => {
						Actions.openCreateSpaceModal();
					}}>
					<Icon name="add" size={[24, 24]} color={"#777"} />
				</div>
				<Divider className="mt-6 w-[calc(100%-8px)] mb-2" />
				{
					spaces.map((item: any) => (
						<div
							onClick={() => {
								setSelectedSpaceId(item.id);
							}}
							key={item.id} className="w-12 h-12 bg-white dark: bg-content1 mt-6 ml-2" style={{ borderRadius: '50%' }}>
							<Avatar alt={item.title} className="w-full h-full" size="lg" src={getUsers()[item.avatar].avatar} isBordered />
						</div>
					))
				}
			</Card>
			<div className="fixed top-0 left-20 w-[calc(100%-144px)] h-full">
				<HomeRoomsList spaceId={selectedSpaceId} />
			</div>
			<HomeInboxModal />
		</div>
	);
}
