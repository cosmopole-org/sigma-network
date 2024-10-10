import { Button } from "@nextui-org/button";
import Icon from "../elements/icon";
import { States } from "@/api/client/states";

export default function AddMacBtn() {
    const edit = States.useListener(States.store.boardEditingMode);
    return (
        <Button
            color="success"
            variant="shadow"
            className={"h-[40px] w-[auto] -translate-x-1/2 absolute left-1/2 bottom-[88px] " + (edit ? "translate-y-0" : "translate-y-[200px]")}
            radius="full"
            onClick={() => {

            }}
        >
            <Icon name="add" />
            <Icon name="bot" />
        </Button>
    );
}