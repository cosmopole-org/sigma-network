import { Actions, RouteSys, States } from "@/api/client/states";
import Icon from "../elements/icon";
import CommandsPalette from "../home/commands-palette";
import { Button } from "@nextui-org/button";

export default function HomeAppsHeader() {
    const showBoardBackgroundState = States.useListener(States.store.showBoardBackground);
    const editing = States.useListener(States.store.boardEditingMode);
    return (
        <div
            className={"backdrop-blur w-full h-[72%] " + (showBoardBackgroundState ? "bg-homeNavbar/75" : "bg-content1/75")}
            style={{ borderRadius: '32px 32px 0px 0px' }}
        >
            <div className="p-3 gap-2 flex flex-nowrap w-auto h-auto absolute left-1/2 -translate-x-1/2">
                <Button
                    isIconOnly
                    variant="shadow"
                    className={"bg-white h-12 w-12 " + (editing ? "bg-success" : undefined)}
                    radius="md"
                    onClick={() => {
                        Actions.switchBoardEditing(!editing);
                    }}
                >
                    <Icon name="bot" color="#000" />
                </Button>
                <Button
                    isIconOnly
                    variant="shadow"
                    color="danger"
                    className="h-12 w-12"
                    radius="md"
                    onClick={() => {
                        Actions.updateSelectedDrawerApp("chat");
                        Actions.switchHomeApps(true);
                    }}
                >
                    <Icon name="chat" />
                </Button>
                <Button
                    isIconOnly
                    variant="shadow"
                    color="warning"
                    className="h-12 w-12"
                    radius="md"
                    onClick={() => {
                        Actions.updateSelectedDrawerApp("files");
                        Actions.switchHomeApps(true);
                    }}
                >
                    <Icon name="storage" />
                </Button>
                <Button
                    isIconOnly
                    variant="shadow"
                    color="primary"
                    className="h-12 w-12"
                    radius="md"
                    onClick={() => {

                    }}
                >
                    <Icon name="settings" />
                </Button>
                <Button
                    isIconOnly
                    variant="shadow"
                    color="success"
                    className="h-12 w-12"
                    radius="md"
                    onClick={() => {
                        RouteSys.push("/app/call")
                    }}
                >
                    <Icon name="call" />
                </Button>
                <CommandsPalette />
            </div>
        </div>
    );
}
