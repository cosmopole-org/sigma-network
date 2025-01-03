
import { mainDrawerOpen, switchMainDrawer } from "../../api/offline/states";
import { useHookstate } from "@hookstate/core"

const MainShadow = () => {
    const show = useHookstate(mainDrawerOpen);
    return show.get({noproxy: true}) ? (
        <div
            onClick={() => {
                switchMainDrawer(false);
            }}
            style={{
                position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, zIndex: 2
            }}
        >
            <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.25)' }} />
        </div>
    ) : <div style={{ width: 0, height: 0 }} />
}

export default MainShadow
