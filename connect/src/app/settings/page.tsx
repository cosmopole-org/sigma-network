import { Navbar, NavbarContent } from "@nextui-org/navbar";
import HomeSearchbar from "@/components/home/home-searchbar";
import ThemeSwitch from "@/components/components/theme-switch";
import BoardBgSwitch from "@/components/components/board-bg-switch";
import WallpaperSwitch from "@/components/components/wallpaper-switch";
import NavAsHomeSwitch from "@/components/components/nav-as-home-switch";

export default function SettingsPage() {
    return (
        <div className="w-full h-full relative overflow-y-auto bg-white dark:bg-content2">
            <Navbar
                isBordered
                className={'bg-content1 pt-10 pb-4'}
            >
                <NavbarContent as="div" className={"items-center w-full"} justify="center">
                    <div className={"w-full"}>
                        <HomeSearchbar />
                    </div>
                </NavbarContent>
            </Navbar >
            <div className="w-full h-auto pl-4 pr-4 pb-20">
                <div className="mt-4 m-h-16 w-full bg-transparent" key={'home'}>
                    <div className="relative w-full">
                        <ThemeSwitch />
                        <BoardBgSwitch />
                        <WallpaperSwitch />
                        <NavAsHomeSwitch />
                    </div>
                </div>
            </div>
        </div>
    )
}
