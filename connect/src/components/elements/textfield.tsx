import { Input } from "@nextui-org/react";
import { useState } from "react";

export default function TextField({ label, onChange, text }: Readonly<{ text?: string, label?: string, onChange?: (text: string) => void }>) {
    const [t, setT] = useState(text ?? "");
    return (
        <Input
            onChange={e => {
                setT(e.target.value);
                onChange && onChange(e.target.value);
            }}
            classNames={{
                inputWrapper: "w-full mt-3 h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                mainWrapper: "w-full",
                base: "w-full"
            }}
            value={t}
            label={label}
            size="lg"
        />
    )
}
