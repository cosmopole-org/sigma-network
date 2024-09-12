import { getUsers } from "@/api/offline/constants"
import { Image } from "@nextui-org/react"
import { RouteSys } from "@/api/offline/states"

export default function PeopleList(props: Readonly<{ className?: string }>) {
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
                            RouteSys.push("/app/profile")
                        }}
                    >
                        <Image
                            alt="Woman listing to music"
                            className="pl-4 pr-4 pt-4 pb-12"
                            height={200}
                            src={item.avatar}
                            width={200}
                        />
                        <div className="backdrop-blur text-center before:bg-white/10 dark:bg-content2/50 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                            <p className="text-tiny">{item.name}</p>
                        </div>
                    </div>
                ))
            }
        </div >
    )
}
