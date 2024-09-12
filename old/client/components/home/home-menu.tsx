import { Avatar, Button, Divider, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import Icon from "../elements/icon";

export default function HomeMenu() {
    return (
        <Popover backdrop="blur" placement="bottom-start" showArrow offset={10}>
            <PopoverTrigger>
                <Avatar
                    isBordered
                    as={"button"}
                    className={"transition-transform"}
                    color={"primary"}
                    name={"Jason Hughes"}
                    size={"sm"}
                    src={"https://i.pravatar.cc/150?u=a042581f4e29026704d"}
                />
            </PopoverTrigger>
            <PopoverContent className="w-[200px]">
                <div className="px-1 py-2 w-full">
                    <p className="text-sm text-foreground">
                        Hawk Cosmopole
                    </p>
                    <p className="mb-4 text-sm font-bold text-foreground">
                        @hawk_cosmopole
                    </p>
                    <Divider />
                    <div className="mt-2 mb-2 flex flex-col gap-2 w-full">
                        <Button
                            key="delete1"
                            className="pl-0 text-left bg-transparent"
                        >
                            <Icon name="add" />
                            Delete file
                            <div className="flex-1" />
                        </Button>
                        <Button
                            key="delete2"
                            className="pl-0 text-left bg-transparent"
                        >
                            <Icon name="add" />
                            Delete file
                            <div className="flex-1" />
                        </Button>
                        <Button
                            key="delete3"
                            className="pl-0 text-left bg-transparent"
                        >
                            <Icon name="add" />
                            Delete file
                            <div className="flex-1" />
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}