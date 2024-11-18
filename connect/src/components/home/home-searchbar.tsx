import { Input } from "@nextui-org/react";
import Icon from "../elements/icon";

export default function HomeSearchbar(props: Readonly<{ height?: number, className?: string }>) {
    return (
        <Input
            classNames={{
                base: "max-w-full sm:max-w-[10rem] h-10",
                mainWrapper: "items-center h-full",
                input: "text-small text-center",
                inputWrapper: "items-center mt-3 h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20 rounded-3xl " + (props.className ?? ""),
            }}
            placeholder="Type to search..."
            size="md"
            startContent={<Icon name="search" size={[18, 18]} />}
            type="search"
            style={{ marginLeft: -1 }}
        />
    )
}
