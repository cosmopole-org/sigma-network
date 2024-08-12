
import { Button } from "@nextui-org/react";
import Icon from "./icon";

export default function IconButton({ name, className, color, size, onClick }: Readonly<{ onClick?: () => void, size?: number[], name: string, className?: string, color?: string }>) {
    return (
        <Button isIconOnly className={"bg-transparent" + (className ? (" " + className) : "")} onClick={onClick}>
            <Icon size={size} name={name} color={color} />
        </Button>
    )
}
