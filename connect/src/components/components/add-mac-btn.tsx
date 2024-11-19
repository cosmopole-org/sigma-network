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
                addWidgetToSDesktop(pos.spaceId, pos.topicId, "ec8ad2f7-d50d-4b8a-a2a3-2175c0994dfc@sigma");
            }}
        >
            <Icon name="add" />
            <Icon name="bot" />
        </Button>
    );
}