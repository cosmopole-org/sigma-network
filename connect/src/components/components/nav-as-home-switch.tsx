import { useTheme } from "@/api/client/states";
import { Switch } from "@nextui-org/switch";

export default function NavAsHomeSwitch() {
    const { navAsHome, setNavAsHome } = useTheme();
    return (
        <div className="flex flex-row w-full mt-4">
            <span className="flex-1">Use navigator as home page</span>
            <Switch isSelected={navAsHome === "true"}
                onChange={() => {
                    setNavAsHome(navAsHome === "false" ? "true" : "false");
                }} />
        </div>
    );
}
