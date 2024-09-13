import { useTheme } from "@/api/client/states";
import { MoonFilledIcon, SunFilledIcon } from "../icons";
import { Switch } from "@nextui-org/switch";

export default function ThemeSwitch() {
    const { theme, setTheme } = useTheme();
    return (
        <div className="flex flex-col w-full">
            <span className="text-lg text-left">App theme</span>
            <span className="text-md text-default-400 text-left">swtich theme between light and dark</span>
            <Switch
                defaultSelected
                size="lg"
                className="absolute right-0 top-3"
                color="primary"
                onChange={() => {
                    if (theme === "light") setTheme("dark")
                    else setTheme("light")
                }}
                startContent={<SunFilledIcon />}
                endContent={<MoonFilledIcon />}
            />
        </div>
    );
}
