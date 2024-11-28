import { getUsers } from "@/api/client/constants"
import Icon from "../elements/icon"
import { RouteSys, useTheme } from "@/api/client/states"
import { useEffect, useState } from "react"
import { User } from "@/api/sigma/models";
import { api } from "@/index";

export default function MachinesList(props: Readonly<{ className?: string }>) {
    const { theme } = useTheme();
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        api.sigma.store.db.collections.users.findOne().exec().then(u => {
            setUser(u);
        });
    }, []);
    return (
        <div
            className={"grid grid-cols-2 gap-3 w-full h-full pl-4 pr-4 pb-20 overflow-y-auto " + props.className}>
            {
                getUsers().map((item) => (
                    <div
                        key={item.id}
                        className="dark:border-white/20 border-1 relative rounded-2xl bg-content2 shadow"
                        style={{ minHeight: 170 }}
                        onClick={() => {
                            RouteSys.push("/app/profile", { user })
                        }}
                    >
                        <Icon name="bot"
                            color={theme === 'light' ? "white" : "black"}
                            className="bg-primary rounded-full absolute left-1/2 -translate-x-1/2 top-6"
                            size={[100, 100]}
                        />
                        <div className="backdrop-blur text-center before:bg-white/10 dark:bg-content2/50 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                            <p className="text-tiny">{item.name}</p>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
