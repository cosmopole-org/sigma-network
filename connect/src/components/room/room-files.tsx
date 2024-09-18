import { getFiles } from "@/api/client/constants"
import { Button, Chip, Image } from "@nextui-org/react"
import { useTheme } from "@/api/client/states";
import Icon from "../elements/icon";

export default function Files() {
    const { theme } = useTheme();
    return (
        <div id="files-list" className="w-full h-full overflow-y-auto relative bg-white dark:bg-content3">
            <div className="gap-3 grid grid-cols-2 sm:grid-cols-4 pl-3 pr-3 pt-4 pb-32">
                {Array.from(Array(4).keys()).map(i => (
                    <Button key={'folder-' + i} onPress={() => console.log("item pressed")}
                        className="w-full h-full col-span-1 bg-white dark:bg-content1" variant="shadow"
                        style={{
                            borderRadius: 16
                        }}>
                        <div className="overflow-visible relative">
                            <Icon
                                name="folder"
                                size={[64, 64]}
                                className="w-full h-[96px] p-6 pl-2 pr-4"
                            />
                        </div>
                        <div className="text-small text-left justify-between flex-1">
                            <b>Folder 1</b>
                            <p className="text-default-900">3 files</p>
                        </div>
                    </Button>
                ))}
                <div className="col-span-2" />
                {getFiles().map((item, index) => {
                    const t = index % 3;
                    if (t === 0) {
                        return (
                            <div className="shadow-medium bg-white dark:bg-content1" style={{ borderRadius: 16 }} key={item.img}>
                                <div className="overflow-visible p-0 relative">
                                    <Chip className="absolute left-2 top-2 z-50"
                                        color="secondary">
                                        <div className="flex">
                                            <Icon name="gallery" size={[16, 16]} className="mr-1 mt-[2px]" />
                                            Photo
                                        </div>
                                    </Chip>
                                    <Chip className="text-xs pt-[2px] absolute right-2 top-2 z-50"
                                        color="primary">
                                        1080 × 720
                                    </Chip>
                                    <Image
                                        shadow="sm"
                                        radius="lg"
                                        width="100%"
                                        alt={item.title}
                                        className="w-full object-cover h-[140px]"
                                        src={'https://nextui.org/' + item.img}
                                    />
                                </div>
                                <div className="text-small justify-between flex flex-row p-3">
                                    <b className="flex-1">{item.title}</b>
                                    <p className="text-default-500">1.4 MB</p>
                                </div>
                            </div>
                        );
                    } else if (t === 1) {
                        return (
                            <div className="shadow-medium bg-white dark:bg-content1" style={{ borderRadius: 16 }} key={item.img}>
                                <div className="overflow-visible p-0 relative">
                                    <Chip className="absolute left-2 top-2 z-50"
                                        color="secondary">
                                        <div className="flex">
                                            <Icon name="gallery" size={[16, 16]} className="mr-1 mt-[2px]" />
                                            Photo
                                        </div>
                                    </Chip>
                                    <Chip className="text-xs pt-[2px] absolute right-2 top-2 z-50"
                                        color="primary">
                                        1080 × 720
                                    </Chip>
                                    <Image
                                        shadow="sm"
                                        radius="lg"
                                        width="100%"
                                        alt={item.title}
                                        className="w-full object-cover h-[140px]"
                                        src={'https://nextui.org/' + item.img}
                                    />
                                    <Button isIconOnly radius="full" className="p-4 absolute left-2/4 top-2/4 -translate-x-1/2 -translate-y-1/2 z-10 w-auto h-auto backdrop-blur" style={{ backgroundColor: theme === 'light' ? '#ffffffbf' : '#171717bf' }}>
                                        <Icon name="play" size={[28, 28]} />
                                    </Button>
                                </div>
                                <div className="text-small justify-between flex flex-row p-3">
                                    <b className="flex-1">{item.title}</b>
                                    <p className="text-default-500">1.4 MB</p>
                                </div>
                            </div>
                        );

                    } else if (t === 2) {
                        return (
                            <div className="shadow-medium bg-white dark:bg-content1" style={{ borderRadius: 16 }} key={item.img}>
                                <div className="overflow-visible p-0 relative">
                                    <Chip className="absolute left-2 top-2 z-50"
                                        color="secondary">
                                        <div className="flex">
                                            <Icon name="music" size={[16, 16]} className="mr-1 mt-[2px]" />
                                            Audio
                                        </div>
                                    </Chip>
                                    <Chip className="absolute right-2 top-2 z-50"
                                        color="primary">
                                        12:25
                                    </Chip>
                                    <Image
                                        shadow="sm"
                                        radius="lg"
                                        width="100%"
                                        alt={item.title}
                                        className="w-full object-cover h-[140px]"
                                        src={'https://nextui.org/' + item.img}
                                    />
                                    <Button isIconOnly radius="full" className="p-4 absolute left-2/4 top-2/4 -translate-x-1/2 -translate-y-1/2 z-10 w-auto h-auto backdrop-blur" style={{ backgroundColor: theme === 'light' ? '#ffffffbf' : '#171717bf' }}>
                                        <Icon name="play" size={[28, 28]} />
                                    </Button>
                                </div>
                                <div className="text-small justify-between flex flex-row p-3">
                                    <b className="flex-1">{item.title}</b>
                                    <p className="text-default-500">1.4 MB</p>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    )
}