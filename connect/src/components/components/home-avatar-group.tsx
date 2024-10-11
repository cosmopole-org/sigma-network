import { RouteSys } from "@/api/client/states";
import { Avatar, AvatarGroup } from "@nextui-org/react";

export default function HomeAvatarGroup({ spaceId }: { spaceId: string }) {
    return (
        <div style={{ zIndex: 2 }} className="w-full h-12 -mt-14 relative">
            <AvatarGroup isBordered className="absolute right-6"
                onClick={() => RouteSys.push("/app/members", { spaceId })}>
                <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
            </AvatarGroup>
        </div>
    );
}
