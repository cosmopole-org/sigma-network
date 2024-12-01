import HomeContent from "@/components/components/home-content";
import HomePage from "../../components/home/home-spaces";
import HomeBottomNav from "@/components/components/home-bottomnav";
import HomeMenuDrawer from "@/components/components/home-menu-drawer";
import { States, useTheme } from "@/api/client/states";

export default function HomeMain() {
    const homeDrawerOpen = States.useListener(States.store.homeDrawerOpen);
    const { navAsHome } = useTheme();
    return (
        <div className="w-full h-full fixed">
            <div style={{ width: navAsHome === "true" ? "100%" : "85%" }} className="h-full overflow-x-hidden overflow-y-auto fixed">
                <HomePage />
            </div>
            <HomeMenuDrawer open={homeDrawerOpen} content={
                <HomeContent />
            } />
            <HomeBottomNav />
        </div>
    );
}
