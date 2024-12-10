import { Button } from "@nextui-org/react";
import Icon from "../elements/icon";
import { Actions } from "@/api/client/states";

export default function ChatsBottomBar() {
    return (
        <div className="w-full absolute bottom-14">
            <div className="w-full relative">
                <Button
                    isIconOnly
                    color="primary"
                    variant="shadow"
                    className="absolute right-2/4 translate-x-[155px]"
                    radius="full"
                    onPress={() => Actions.switchChatsFoldersModal(true)}
                >
                    <Icon name="storage" />
                </Button>
                <Button
                    isIconOnly
                    color="primary"
                    variant="shadow"
                    className="absolute left-2/4 -translate-x-[155px]"
                    radius="full"
                    onPress={() => Actions.switchChatsArchiveModal(true)}
                >
                    <Icon name="archive" />
                </Button>
                <Button
                    color="primary"
                    variant="shadow"
                    className="absolute left-2/4 -translate-x-1/2 h-10 text-lg"
                    radius="full"
                    onPress={() => Actions.openCreateSpaceModal()}
                >
                    <Icon name="add" />
                    Create new space
                </Button>
            </div>
        </div>
    )
}
