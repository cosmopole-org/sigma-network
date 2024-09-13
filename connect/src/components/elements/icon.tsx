import { getSvgIconPath } from "@/api/client/resources";
import icons from "../icons";
import { IconType } from "@/types";
import { Card } from "@nextui-org/react";

export default function Icon({ name, color, size = [24, 24], iconType, className }: Readonly<{ className?: string, name: string, color?: string, size?: number[], iconType?: IconType }>) {
    let IconComp = null;
    if (icons[name]) {
        const I = icons[name];
        IconComp = <I color={color} size={size} className={className} />
    } else {
        IconComp = <img width={size[0]} height={size[1]} alt={'icon'} src={getSvgIconPath(name)} className={iconType === 'circle' ? undefined : className} />;
    }
    if (iconType === 'circle') {
        return <Card shadow="none" className={"rounded-3xl w-auto h-auto bg-s-white dark:bg-s-black items-center justify-center " + (className ?? "")} style={{ minWidth: 8 + size[0], minHeight: 8 + size[1] }}>{IconComp}</Card>
    } else {
        return IconComp
    }
}