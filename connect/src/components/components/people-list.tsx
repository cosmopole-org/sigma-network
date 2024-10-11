import { getUsers } from "@/api/client/constants"
import { Image } from "@nextui-org/react"
import { RouteSys } from "@/api/client/states"
import { MemberUser } from "@/api/sigma/models"

export default function PeopleList(props: Readonly<{ className?: string, people: MemberUser[] }>) {
    return (
        <div
            className={"grid grid-cols-2 gap-3 w-full h-full pl-4 pr-4 pb-20 overflow-y-auto " + props.className}>
            {
                props.people.map((item) => (
                    <div
                        key={item.id}
                        className="dark:border-white/20 border-1 relative rounded-2xl bg-content2 shadow"
                        style={{ minHeight: 170, maxHeight: 170 }}
                        onClick={() => {
                            RouteSys.push("/app/profile", { user: item.user });
                        }}
                    >
                        <Image
                            alt="Woman listing to music"
                            className="pl-4 pr-4 pt-4 pb-12"
                            height={200}
                            src={item.user.avatar}
                            width={200}
                        />
                        <div className="backdrop-blur text-center before:bg-white/10 dark:bg-content2/50 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                            <p className="text-tiny">{item.user.name}</p>
                        </div>
                    </div>
                ))
            }
        </div >
    )
}
