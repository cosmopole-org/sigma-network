import { Avatar, Card } from "@nextui-org/react";
import HomeRoomsList from "@/components/home/home-rooms-list";
import Icon from "@/components/elements/icon";
import HomeInboxModal from "@/components/home/home-inbox-modal";
import { Actions, useTheme } from "@/api/client/states";
import { getUsers } from "@/api/client/constants";
import { useEffect, useState } from "react";
import { api } from "@/index";
import { Space } from "@/api/sigma/models";

export default function HomePage() {
	const [selectedSpaceId, setSelectedSpaceId] = useState("");
	const [spaces, setSpaces] = useState<Space[]>([]);
	const { navAsHome } = useTheme();
	useEffect(() => {
		const spacesObservable = api.sigma.store.db.spaces.find().$;
		let spacesSub = spacesObservable.subscribe(ss => {
			if (selectedSpaceId === "") {
				setSelectedSpaceId(ss.length > 0 ? (ss[0] as any).id : "");
			}
			setSpaces(ss);
		});
		if (navAsHome === "true") {
			Actions.updateHomeMenuState(true);
		}
		return () => {
			spacesSub.unsubscribe();
		}
	}, []);
	const homeSpace = spaces[0];
	return (
		<div className="relative flex flex-col h-screen w-full bg-s-white dark:bg-content2">
			<Card shadow={navAsHome ? 'none' : 'md'} className="w-20 h-full bg-s-white dark:bg-content2 pl-2 pt-12 fixed overflow-y-auto" style={{ borderRadius: 0 }}>
				{homeSpace ? (
					<div
						onClick={() => {
							setSelectedSpaceId(spaces[0].id);
						}}
						key={homeSpace.id} className="w-12 h-12 mt-6 ml-2" style={{ borderRadius: '50%' }}>
						<Card className="w-full h-full bg-content3 pt-2 pl-2 pr-2" shadow="md" style={{borderRadius: '50%', minHeight: 48}}>
							<Icon name="home" size={[32,32]} />
						</Card>
					</div>
				) : null}
				<div
					onClick={() => {
						Actions.openCreateSpaceModal();
					}}
					key={"add"} className="w-12 h-12 mt-6 ml-2" style={{ borderRadius: '50%' }}>
					<Card className="w-full h-full bg-content3 pt-2 pl-2 pr-2" shadow="md" style={{borderRadius: '50%', minHeight: 48}}>
						<Icon name="add" size={[32,32]} />
					</Card>
				</div>
				{
					spaces.slice(1).map((item: any) => (
						<div
							onClick={() => {
								setSelectedSpaceId(item.id);
							}}
							key={item.id} className="w-12 h-12 bg-white dark: bg-content1 mt-6 ml-2" style={{ borderRadius: '50%' }}>
							<Avatar alt={item.title} className="w-full h-full" size="lg" src={getUsers()[item.avatar]?.avatar} isBordered />
						</div>
					))
				}
			</Card>
			<div className={`fixed left-20 h-full overflow-hidden`} style={{ width: navAsHome ? '100%' : 'calc(100% - 144px)', top: navAsHome === "true" ? 58 : 0, borderRadius: navAsHome ? '32px 0px 0px 0px' : 0 }}>
				<HomeRoomsList isNavAsHome={navAsHome === "true"} spaceId={selectedSpaceId} />
			</div>
			<HomeInboxModal />
		</div>
	);
}
