import { RouteSys } from "@/api/client/states";
import TextField from "@/components/elements/textfield";
import { api } from "@/index";
import { Button } from "@nextui-org/button";
import { useCallback, useRef } from "react";

export default function CreateTopicModal({ spaceId }: Readonly<{ spaceId: string }>) {
    const titleRef = useRef("");
    const onClose = useCallback(() => RouteSys.pop(), []);
    return (
        <div className="w-full h-full relative overflow-y-auto bg-white dark:bg-content2 pt-20 pl-4 pr-4">
            <div>
                <p className="mb-2">
                    Please choose a name for your topic.
                </p>
                <TextField label="Topic Name" onChange={t => { titleRef.current = t; }} />
            </div>
            <div className="absolute bottom-4 right-4">
                <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                </Button>
                <Button className="ml-4" color="primary" onPress={async () => {
                    if (titleRef.current.length > 0) {
                        await api.sigma.services?.topics.create({ title: titleRef.current, spaceId })
                        onClose();
                    } else {
                        alert("title can not be empty");
                    }
                }}>
                    Create
                </Button>
            </div>
        </div>
    )
}
