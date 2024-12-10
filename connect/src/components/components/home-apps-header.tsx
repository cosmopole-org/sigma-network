import { Actions, RouteSys, States } from "@/api/client/states";
import Icon from "../elements/icon";
import CommandsPalette from "../home/commands-palette";
import { Button } from "@nextui-org/react";

export default function HomeAppsHeader() {
    const editing = States.useListener(States.store.boardEditingMode);
    return (
        <div
            className={"backdrop-blur w-[calc(100%-16px)] h-[72px] ml-2 -mt-[8px] " + ("bg-content1/75")}
            style={{ borderRadius: 32 }}
        >
            <div className="p-3 gap-2 flex flex-nowrap w-auto h-auto absolute left-1/2 -translate-x-1/2">
                <Button
                    isIconOnly
                    variant="shadow"
                    color="success"
                    className="h-12 w-12"
                    radius="lg"
                    onPress={() => {
                        RouteSys.push("/app/call")
                    }}
                >
                    <Icon name="call" />
                </Button>
                <Button
                    isIconOnly
                    variant="shadow"
                    color="danger"
                    className="h-12 w-12"
                    radius="lg"
                    onPress={() => {
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
                    radius="lg"
                    onPress={() => {
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
                    radius="lg"
                    onPress={() => {
                        Actions.updateSelectedDrawerApp("bots");
                        Actions.switchHomeApps(true);
                    }}
                >
                    <Icon name="bot" />
                </Button>
                <CommandsPalette />
                <Button
                    isIconOnly
                    variant="shadow"
                    className={"bg-white h-12 w-12 " + (editing ? "bg-success" : undefined)}
                    radius="lg"
                    onPress={() => {
                        Actions.switchBoardEditing(!editing);
                    }}
                >
                    <Icon name="blocks" color="#000" />
                </Button>
            </div>
        </div>
    );
}
