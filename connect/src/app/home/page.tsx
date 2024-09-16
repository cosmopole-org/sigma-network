import HomeContent from "@/components/components/home-content";
import HomePage from "../../components/home/home-spaces";
import HomeBottomNav from "@/components/components/home-bottomnav";
import HomeMenuDrawer from "@/components/components/home-menu-drawer";
import { getCurrentTabId, States } from "@/api/client/states";

export default function HomeMain() {
    const homeDrawerOpen = States.useListener(States.appStateStore[getCurrentTabId()]['main'].homeDrawerOpen);
    return (
        <div className="w-full h-full fixed">
            <div className="w-[85%] h-full overflow-x-hidden overflow-y-auto fixed">
                <HomePage />
            </div>
            <HomeMenuDrawer open={homeDrawerOpen} content={
                <HomeContent />
            } />
            <HomeBottomNav />
        </div>
    );
}
