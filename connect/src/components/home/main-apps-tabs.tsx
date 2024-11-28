import { Tab, Tabs } from "@nextui-org/react";
import Icon from "../elements/icon";
import { Actions, States } from "@/api/client/states";
import { Key } from "react";

export default function MainAppsTabs() {
    const selectedDrawerApp = States.useListener(States.store.selectedDrawerApp);
    return (
        <Tabs onSelectionChange={(k: Key) => {
            Actions.updateSelectedDrawerApp(k.toString());
        }} selectedKey={selectedDrawerApp} variant={"light"} color={"primary"} radius="full" aria-label="Tabs colors" fullWidth className={"bg-white dark:bg-content1 rounded-3xl ml-4 w-[calc(100%-32px)]"}>
            <Tab key={"chat"} title={
                <div className="flex items-center space-x-2">
                    <Icon name="chat" />
                    <span>Chat</span>
                </div>
            } />
            <Tab key={"bots"} title={
                <div className="flex items-center space-x-2">
                    <Icon name="bot" />
                    <span>Bots</span>
                </div>
            } />
            <Tab key={"files"} title={
                <div className="flex items-center space-x-2">
                    <Icon name="storage" />
                    <span>Storage</span>
                </div>
            } />
        </Tabs>
    )
}
