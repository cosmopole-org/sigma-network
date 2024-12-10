import { RouteSys } from "@/api/client/states";
import Icon from "@/components/elements/icon";
import TextField from "@/components/elements/textfield";
import { api } from "@/index";
import { Button } from "@nextui-org/react";
import { useCallback, useRef } from "react";

export default function CreateSpaceModal() {
    const titleRef = useRef("");
    const onClose = useCallback(() => RouteSys.pop(), []);
    return (
        <div className="w-full h-full relative overflow-y-auto bg-white dark:bg-content2 pt-20 pl-4 pr-4">
            <div>
                <p className="mb-2 ml-1">
                    Please choose a name for your space.
                </p>
                <TextField label="Space Name" onChange={t => { titleRef.current = t; }} />
            </div>
            <div className="absolute bottom-4 right-4">
                <Button isIconOnly className="ml-4" color="success" size="lg" onPress={async () => {
                    if (titleRef.current.length > 0) {
                        await api.sigma.services?.spaces.create({ title: titleRef.current, isPublic: false })
                        onClose();
                    } else {
                        alert("title can not be empty");
                    }
                }}>
                    <Icon name="tick" />
                </Button>
            </div>
        </div>
    )
}
