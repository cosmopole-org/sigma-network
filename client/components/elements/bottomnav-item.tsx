import { Card } from "@nextui-org/react";
import Icon from "./icon";

export function BottomNavItem({ selected, itemKey, icon, title, onClick, iconSize = 24, pt, pb }: Readonly<{ pt?: number, pb?: number, iconSize?: number, onClick?: () => void, title?: string, icon?: string, selected: string | undefined, itemKey: string | undefined }>) {
    const isCurrent = selected === itemKey;
    let size = iconSize
    return (
        <Card className="items-center bg-transparent pt-2 h-full" isPressable shadow="none" onClick={onClick}>
            {
                icon ? (
                    <div
                        style={{ paddingTop: (isCurrent ? 3 : 0) + (pt ?? 0), paddingBottom: (isCurrent ? 3 : 0) + (pb ?? 0), transform: isCurrent ? 'scale(1.15)' : 'scale(1)', transition: 'transform 250ms' }}
                        className={(isCurrent ? "rounded-2xl bg-primary px-4" : "")}
                    >
                        <Icon name={icon} size={[size, size]} color={isCurrent ? '#fff' : undefined} />
                    </div>
                ) : null
            }
            <span className="text-sm mt-1">{title ?? null}</span>
        </Card >
    )
}
