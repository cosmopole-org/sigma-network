import { Button } from "@nextui-org/button";
import Icon from "../elements/icon";
import { Actions } from "@/api/offline/states";

export default function ChatsBottomBar() {
    return (
        <div className="w-full absolute bottom-4">
            <div className="w-full relative">
                <Button
                    isIconOnly
                    color="primary"
                    variant="shadow"
                    className="absolute right-2/4 translate-x-[155px]"
                    radius="full"
                    onClick={() => Actions.switchChatsFoldersModal(true)}
                >
                    <Icon name="storage" />
                </Button>
                <Button
                    isIconOnly
                    color="primary"
                    variant="shadow"
                    className="absolute left-2/4 -translate-x-[155px]"
                    radius="full"
                    onClick={() => Actions.switchChatsArchiveModal(true)}
                >
                    <Icon name="archive" />
                </Button>
                <Button
                    color="primary"
                    variant="shadow"
                    className="absolute left-2/4 -translate-x-1/2 h-10 text-lg"
                    radius="full"
                    onClick={() => Actions.switchTowerCreateModal(true)}
                >
                    <Icon name="add" />
                    Create new space
                </Button>
            </div>
        </div>
    )
}
