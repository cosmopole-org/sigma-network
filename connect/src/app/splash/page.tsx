import { Logo } from "@/components/icons";

export default function SplashPage() {
    return (
        <div className="w-full h-full relative overflow-y-auto bg-white dark:bg-content2">
            <Logo className="w-48 h-48 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
    )
}
