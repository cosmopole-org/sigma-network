import { Input } from "@nextui-org/react";

export default function TextField({ label, onChange, text }: Readonly<{ text?: string, label?: string, onChange?: (text: string) => void }>) {
    return (
        <Input
            onChange={e => onChange && onChange(e.target.value)}
            classNames={{
                inputWrapper: "w-full mt-3 h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                mainWrapper: "w-full",
                base: "w-full"
            }}
            value={text ?? ""}
            label={label}
            size="lg"
        />
    )
}
