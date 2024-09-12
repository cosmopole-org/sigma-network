import { useTheme } from "@/api/offline/states";

export default function Circles({ className }: Readonly<{ className?: string }>) {
    const { theme } = useTheme();
    return (
        <div className={className} style={{ backgroundColor: theme === 'light' ? 'rgb(41, 98, 255)' : '#7828C8' }}>
            <ul className="circles">
                {Array.from(Array(10).keys()).map(i => <li style={{ backgroundColor: theme === 'light' ? '#fff7' : '#0005' }} key={i}></li>)}
            </ul>
        </div >
    );
}
