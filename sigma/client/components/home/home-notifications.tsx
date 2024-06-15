import { Button, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import Icon from "../elements/icon";

export default function HomeNotifications() {
    return (
        <Popover backdrop="blur" placement="bottom-end" showArrow offset={10}>
            <PopoverTrigger>
                <Button className="-mt-[2px] bg-transparent transition-transform" isIconOnly>
                    <Icon name="notification" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto m-w-320">
                <div className="px-1 py-2 w-full">
                    <p className="text-sm text-foreground">
                        Notificatin Center
                    </p>
                    <div className="mt-2 mb-2 flex flex-col gap-2 w-full">
                        {
                            Array.from(Array(5).keys()).map(i => (
                                <Button
                                    key="delete1"
                                    className="pl-0 text-left bg-transparent"
                                >
                                    <Icon name="invite" />
                                    You've been invited to central tower.
                                    <div className="flex-1" />
                                </Button>
                            ))
                        }
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}