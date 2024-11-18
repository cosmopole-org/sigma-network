
import { Button } from "@nextui-org/react";
import Icon from "./icon";
import { IconType } from "@/types";

export default function IconButton({ name, className, color, size, onClick, iconType }: Readonly<{ iconType?: IconType, onClick?: () => void, size?: number[], name: string, className?: string, color?: string }>) {
    return (
        <Button isIconOnly className={"bg-transparent" + (className ? (" " + className) : "")} onClick={onClick}>
            <Icon iconType={iconType} size={size} name={name} color={color} />
        </Button>
    )
}
