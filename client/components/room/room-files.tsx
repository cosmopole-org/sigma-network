"use client"

import { getFiles } from "@/api/offline/constants"
import { Button, Card, CardBody, CardFooter, Chip, Image } from "@nextui-org/react"
import { useTheme } from "next-themes"
import Icon from "../elements/icon";

export default function Files() {
    const { theme } = useTheme();
    return (
        <div className="w-full relative">
            <div className="gap-3 grid grid-cols-2 sm:grid-cols-4 pl-3 pr-3 pt-3 pb-32">
                {Array.from(Array(4).keys()).map(i => (
                    <Card isBlurred shadow="sm" key={'folder-' + i} isPressable onPress={() => console.log("item pressed")} style={{ backgroundColor: theme === 'light' ? undefined : '#171717bf' }}>
                        <CardBody className="overflow-visible p-0 relative">
                            <Chip className="absolute left-2 top-2"
                                color="secondary">
                                Folder
                            </Chip>
                            <Icon
                                name="folder"
                                size={[64, 64]}
                                className="w-full h-[140px] pl-2 pr-2 pb-2 pt-8"
                            />
                        </CardBody>
                        <CardFooter className="text-small justify-between">
                            <b>Folder 1</b>
                            <p className="text-default-500">3 files</p>
                        </CardFooter>
                    </Card>
                ))}
                {getFiles().map((item, index) => {
                    const t = index % 3;
                    if (t === 0) {
                        return (
                            <Card isBlurred shadow="sm" key={item.img} isPressable onPress={() => console.log("item pressed")} style={{ backgroundColor: theme === 'light' ? undefined : '#171717bf' }}>
                                <CardBody className="overflow-visible p-0 relative">
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
                                </CardBody>
                                <CardFooter className="text-small justify-between">
                                    <b>{item.title}</b>
                                    <p className="text-default-500">1.4 MB</p>
                                </CardFooter>
                            </Card>
                        );
                    } else if (t === 1) {
                        return (
                            <Card isBlurred shadow="sm" key={item.img} isPressable onPress={() => console.log("item pressed")} style={{ backgroundColor: theme === 'light' ? undefined : '#171717bf' }}>
                                <CardBody className="overflow-visible p-0 relative">
                                    <Chip className="absolute left-2 top-2 z-50"
                                        color="secondary">
                                        <div className="flex">
                                            <Icon name="video" size={[16, 16]} className="mr-1 mt-[2px]" />
                                            Video
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
                                </CardBody>
                                <CardFooter className="text-small justify-between">
                                    <b>{item.title}</b>
                                    <p className="text-default-500">1.4 MB</p>
                                </CardFooter>
                            </Card>
                        );

                    } else if (t === 2) {
                        return (
                            <Card isBlurred shadow="sm" key={item.img} isPressable onPress={() => console.log("item pressed")} style={{ backgroundColor: theme === 'light' ? undefined : '#171717bf' }}>
                                <CardBody className="overflow-visible p-0 relative">
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
                                </CardBody>
                                <CardFooter className="text-small justify-between">
                                    <b>{item.title}</b>
                                    <p className="text-default-500">1.4 MB</p>
                                </CardFooter>
                            </Card>
                        );
                    }
                })}
            </div>
        </div>
    )
}