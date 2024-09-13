import { Avatar, Button } from "@nextui-org/react";
import Icon from "../elements/icon";
import { RouteSys } from "@/api/client/states";
import { getUsers } from "@/api/client/constants";

export default function HomeInfoBox({ className }: Readonly<{ className: string }>) {
    return (
        <div className={"overflow-hidden w-full h-auto " + (className ?? "")}>
            <Avatar color="default" isBordered className="w-32 h-32 ml-auto mr-auto mt-12" src={getUsers()[0].avatar} />
            <p className="text-xl text-center w-full mt-6" style={{ color: '#fff' }}>My Books</p>
            <Button
                isIconOnly
                variant="shadow"
                color="secondary"
                className="h-12 w-12 absolute top-32 right-0"
                style={{ borderRadius: '24px 0px 0px 24px' }}
                onClick={() => {
                    RouteSys.push("/app/room-machines")
                }}
            >
                <Icon name="blocks" />
            </Button>
        </div>
    );
}
