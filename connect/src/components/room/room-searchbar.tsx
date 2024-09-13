import { Input } from "@nextui-org/react";
import Icon from "../elements/icon";
import { useTheme } from "@/api/client/states";

export default function RoomSearchbar() {
    const { theme } = useTheme();
    return (
        <Input
            classNames={{
                base: "max-w-full h-10",
                mainWrapper: "items-center h-full",
                input: "text-small text-center " + (theme === 'light' ? "placeholder:text-white" : ""),
                inputWrapper: "items-center mt-3 h-full font-normal text-default-500 bg-s-white/30 dark:bg-default-500/20 rounded-3xl",
            }}
            placeholder="Type to search..."
            size="md"
            startContent={<Icon color={theme === 'light' ? '#fff' : undefined} name="search" size={[18, 18]} />}
            type="search"
            style={{ marginLeft: -1 }}
        />
    )
}
