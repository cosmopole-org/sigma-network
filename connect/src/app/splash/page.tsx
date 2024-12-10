import { Logo } from "@/components/icons";
import { Button, Spinner } from "@nextui-org/react";

export default function SplashPage({ update }: { update?: () => void }) {
    return (
        <div className="w-full h-full relative overflow-y-auto bg-white dark:bg-content2">
            <Logo className="w-48 h-48 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
            {update ? (
                <Button radius="full" className="w-48 h-14 absolute left-1/2 top-2/3 -translate-x-1/2 -translate-y-1/2"  onPress={() => {
                    document.body.requestFullscreen()
                    if (update) {
                        setTimeout(() => {
                            update();
                        }, 100);
                    }
               }}>Enter</Button>
            ) : (
                <Spinner className="w-48 h-14 absolute left-1/2 top-2/3 -translate-x-1/2 -translate-y-1/2" />
            )}
        </div>
    )
}
