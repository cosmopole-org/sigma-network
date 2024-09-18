
import { Actions } from "@/api/client/states";
import Backdrop from "../components/backdrop";
import MainAppsTabs from "./main-apps-tabs";
import HomeAppsHeader from "../components/home-apps-header";
import HomeAppsDrawer from "../components/home-apps-drawer";
import { useMemo } from "react";
import HomeApps from "../components/home-apps";

const MainTools = () => {
    const memOpenedHeadView = useMemo(() => <HomeAppsHeader />, []);
    const memClosedHeadView = useMemo(() => <MainAppsTabs />, []);
    return (
        <>
            <Backdrop stateName={"homeAppsOpen"} stateChangerName="switchHomeApps" />
            <HomeAppsDrawer
                contentView={<HomeApps />}
                openedHeadView={memOpenedHeadView}
                closedHeadView={memClosedHeadView}
                room={undefined}
                needToCloseRecorder={false}
                onClose={() => {
                    Actions.switchHomeApps(false);
                }} onOpen={() => {
                    Actions.switchHomeApps(true);
                }} />
        </>
    );
}

export default MainTools;
