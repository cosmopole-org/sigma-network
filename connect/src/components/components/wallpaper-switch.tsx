import { useTheme } from "@/api/client/states";
import { Switch } from "@nextui-org/switch";

export default function WallpaperSwitch() {
    const { wallpaper, setWallpaper } = useTheme();
    return (
        <div className="flex flex-row w-full mt-4">
            <span className="flex-1">Show Board Wallpaper</span>
            <Switch isSelected={wallpaper !== ""}
                onChange={() => {
                    setWallpaper(wallpaper === "" ? "true" : "");
                }} />
        </div>
    );
}
