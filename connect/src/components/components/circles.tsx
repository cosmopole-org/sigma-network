import { useTheme } from "@/api/client/states";

export default function Circles({ className }: Readonly<{ className?: string }>) {
    const { theme, wallpaper } = useTheme();
    if (wallpaper === "") {
        return (
            <div className={"bg-primary " + className}>
                <ul className="circles">
                    {Array.from(Array(10).keys()).map(i => <li style={{ backgroundColor: theme === 'light' ? '#fff7' : '#0005' }} key={i}></li>)}
                </ul>
            </div >
        );
    } else {
        return (
            <div className={className}>
                <img alt={"wallpaper"} src={theme === "light" ?
                    "https://i.pinimg.com/736x/01/fc/bf/01fcbf9fc9932a394100ee51e4cf224f.jpg" :
                    "https://i.pinimg.com/736x/01/fc/bf/01fcbf9fc9932a394100ee51e4cf224f.jpg"
                } className={className} />
            </div>
        )
    }
}
