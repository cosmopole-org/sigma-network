import { RouteSys } from "@/api/client/states";
import { Avatar, AvatarGroup } from "@nextui-org/react";

export default function HomeAvatarGroup() {
    return (
        <div style={{ zIndex: 1 }} className="w-full h-12 -mt-12 relative">
            <AvatarGroup isBordered className="absolute left-1/2 -translate-x-1/2"
                onClick={() => RouteSys.push("/app/contacts")}>
                <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026302d" />
                <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
                <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
            </AvatarGroup>
        </div>
    );
}
