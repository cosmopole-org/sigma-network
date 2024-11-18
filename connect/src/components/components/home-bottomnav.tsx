import { Card } from "@nextui-org/react";
import { BottomNavItem } from "../elements/bottomnav-item";
import { RouteSys, States } from "@/api/client/states";

export default function HomeBottomNav({ style }: Readonly<{ style?: any }>) {
    const open = States.useListener(States.store.homeDrawerOpen);
    const onItemClick = (key: string) => () => {
        switch (key) {
            case "contacts": {
                RouteSys.push("/app/contacts");
                break;
            }
            case "settings": {
                RouteSys.push("/app/settings");
                break;
            }
            case "chats": {
                RouteSys.push("/app/chats");
                break;
            }
            case "explore": {
                RouteSys.push("/app/explore");
                break;
            }
        }
    }
    return (
        <Card className="dark:bg-content3 bg-content3 grid grid-cols-4 sticky bottom-0 left-0 w-full h-[72px]" style={{
            borderRadius: '24px 24px 0px 0px', zIndex: 50,
            transform: `translate(0px, ${open ? '0%' : '150%'})`,
            ...style
        }}>
            <BottomNavItem itemKey="contacts" selected={""} title="Contacts" icon="people" onClick={onItemClick('contacts')} />
            <BottomNavItem itemKey="chats" selected={""} title="Chats" icon="chat" onClick={onItemClick('chats')} />
            <BottomNavItem itemKey="explore" selected={""} title="Explore" icon="explore" onClick={onItemClick('explore')} />
            <BottomNavItem pt={2} pb={3} iconSize={19} itemKey="settings" selected={""} title="Settings" icon="settings" onClick={onItemClick('settings')} />
        </Card>
    )
}
