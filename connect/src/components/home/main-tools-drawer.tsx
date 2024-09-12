
import { Actions } from "@/api/offline/states";
import Backdrop from "../components/backdrop";
import MainAppsTabs from "./main-apps-tabs";
import HomeAppsHeader from "../components/home-apps-header";
import HomeAppsDrawer from "../components/home-apps-drawer";
import { useMemo } from "react";
import HomeApps from "../components/home-apps";

const MainTools = () => {
    const memContentView = useMemo(() => <HomeApps />, []);
    const memOpenedHeadView = useMemo(() => <HomeAppsHeader />, []);
    const memClosedHeadView = useMemo(() => <MainAppsTabs />, []);
    return (
        <>
            <Backdrop stateName={"homeAppsOpen"} stateChangerName="switchHomeApps" />
            <HomeAppsDrawer
                contentView={memContentView}
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
