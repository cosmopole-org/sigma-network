import { RouteSys, useTheme } from "@/api/client/states";
import { Avatar, AvatarGroup } from "@nextui-org/react";

export default function HomeAvatarGroup({ spaceId }: { spaceId: string }) {
    const { wallpaper } = useTheme();
    return (
        <div style={{ zIndex: 2, marginTop: wallpaper === "true" ? -56 : -48 }} className="w-full relative">
            <AvatarGroup isBordered className="absolute right-6"
                onClick={() => RouteSys.push("/app/members", { spaceId })}>
                <Avatar size={wallpaper === "true" ? "sm" : "md"} src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                <Avatar size={wallpaper === "true" ? "sm" : "md"} src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                <Avatar size={wallpaper === "true" ? "sm" : "md"} src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                <Avatar size={wallpaper === "true" ? "sm" : "md"} src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
            </AvatarGroup>
        </div>
    );
}
