import { Navbar, NavbarContent } from "@nextui-org/react";
import HomeFolders from "./home-folders";
import HomeSearchbar from "./home-searchbar";

export default function HomeNavbar({ sectionKey }: Readonly<{ sectionKey: string }>) {
    return (
        <Navbar
            isBordered
            className={'bg-content1 ' + (sectionKey !== 'spaces' ? undefined : 'absolute') + " " + (sectionKey === 'spaces' ? "h-[92px] pb-0" : "h-[56px] pb-0")}
            style={{ transform: 'translateY(-1px)', transition: 'transform 400ms' }}
        >
            <NavbarContent as="div" className={"items-center w-full " + (sectionKey === 'spaces' ? "h-[92px]" : "h-[56px]")} justify="center">
                <div className={"w-full"} style={{ paddingTop: (sectionKey === 'spaces' ? 4 : 0) }}>
                    <HomeSearchbar />
                    {
                        sectionKey === 'spaces' ? (
                            <HomeFolders />
                        ) : null
                    }
                </div>
            </NavbarContent>
        </Navbar >
    )
}
