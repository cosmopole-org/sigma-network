import { Card } from "@nextui-org/react";
import Icon from "./icon";

export function BottomNavItem({ color, selected, itemKey, icon, title, onClick, iconSize = 24, pt, pb, iconOnly }: Readonly<{ color?: string, iconOnly?: boolean, pt?: number, pb?: number, iconSize?: number, onClick?: () => void, title?: string, icon?: string, selected: string | undefined, itemKey: string | undefined }>) {
    const isCurrent = selected === itemKey;
    let size = iconSize
    return (
        <Card className="items-center bg-transparent pt-4 h-full" isPressable shadow="none" onPress={onClick}>
            {icon ? (
                <div
                    style={{ paddingTop: (isCurrent ? 3 : 0) + (pt ?? 0), paddingBottom: (isCurrent ? 3 : 0) + (pb ?? 0), transform: isCurrent ? 'scale(1.15)' : 'scale(1)', transition: 'transform 250ms' }}
                    className={(isCurrent ? "rounded-2xl bg-primary px-4" : "")}
                >
                    <Icon name={icon} size={[size, size]} color={isCurrent ? '#fff' : color} />
                </div>
            ) : null}
            {iconOnly ? null : <span className={"text-sm mt-1 " + (color ? ("text-" + color) : "")}>{title ?? null}</span>}
        </Card >
    )
}
