import { Input } from "@nextui-org/react";

export default function TextField({ label }: Readonly<{ label?: string }>) {
    return (
        <Input
            classNames={{
                inputWrapper: "mt-3 h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
            }}
            label={label}
            size="lg"
        />
    )
}
