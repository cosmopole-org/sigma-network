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
                    "https://i.pinimg.com/564x/93/f0/a6/93f0a6e5e70f516dc31c051238538fc7.jpg" :
                    "https://i.pinimg.com/564x/ef/25/46/ef254691fa98c2b96a1c2ae03a6dc3b6.jpg"
                } className={className} />
            </div>
        )
    }
}
