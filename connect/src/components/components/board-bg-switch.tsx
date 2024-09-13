import { Actions, States } from "@/api/client/states";
import { Switch } from "@nextui-org/switch";

export default function BoardBgSwitch() {
    const showBoardBackgroundState = States.useListener(States.store.showBoardBackground);
    return (
        <div className="flex flex-row w-full mt-4">
            <span className="flex-1">Show Board Background</span>
            <Switch isSelected={showBoardBackgroundState}
                onChange={() => {
                    Actions.setShowBoardBackground(!showBoardBackgroundState);
                }} />
        </div>
    );
}
