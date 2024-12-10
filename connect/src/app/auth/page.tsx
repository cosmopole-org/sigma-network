import Icon from "@/components/elements/icon";
import TextField from "@/components/elements/textfield";
import { Logo } from "@/components/icons";
import { api } from "@/index";
import { Button, Card } from "@nextui-org/react";
import { useRef } from "react";

export default function AuthPage() {
    const usernameRef = useRef("");
    const passwordRef = useRef("");
    return (
        <div className="w-full h-full relative overflow-y-auto bg-white dark:bg-content2">
            <Logo className="w-48 h-48 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[300px]" />
            <Card className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-64px)] pl-6 pr-6 pt-6 pb-6">
                <TextField label="username" onChange={t => { usernameRef.current = t; }} />
                <TextField label="password" onChange={t => { passwordRef.current = t; }} />
                <Button color="primary" className="mt-6" onPress={() => {
                    if (usernameRef.current.length > 0 && passwordRef.current.length > 0) {
                        api.sigma.services?.users.create({
                            username: usernameRef.current,
                            name: usernameRef.current,
                            secret: passwordRef.current
                        });
                    } else {
                        alert("username or password can not be empty")
                    }
                }}>
                    <Icon name="apps" />
                    Login
                </Button>
            </Card>
        </div >
    )
}
