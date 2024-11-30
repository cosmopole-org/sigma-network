import { Button } from "@nextui-org/button";
import Icon from "../elements/icon";
import { States } from "@/api/client/states";
import { addWidgetToSDesktop } from "./desk";

export default function AddMacBtn() {
    const pos = States.useListener(States.store.currentPos);
    const edit = States.useListener(States.store.boardEditingMode);
    return (
        <Button
            color="success"
            variant="shadow"
            className={"h-[40px] w-[auto] -translate-x-1/2 absolute left-1/2 bottom-[88px] " + (edit ? "translate-y-0" : "translate-y-[200px]")}
            radius="full"
            onClick={() => {
                // weather
                // addWidgetToSDesktop(pos.spaceId, pos.topicId, "34e497b4-bb4a-453e-85e3-5063957bc52d@sigma");
                // excalidraw
                addWidgetToSDesktop(pos.spaceId, pos.topicId, "31311a7a-bc33-4400-9694-71e02a5dbba9@sigma");
                // spotify
                // addWidgetToSDesktop(pos.spaceId, pos.topicId, "6b59d0d5-1f81-4f6d-b980-e998015f3a62@sigma");
                // calendar
                // addWidgetToSDesktop(pos.spaceId, pos.topicId, "58a2fc59-9f9d-4210-8e00-60e98b89b197@sigma");
                // clock
                // addWidgetToSDesktop(pos.spaceId, pos.topicId, "ec8ad2f7-d50d-4b8a-a2a3-2175c0994dfc@sigma");
            }}
        >
            <Icon name="add" />
            <Icon name="bot" />
        </Button>
    );
}