import { Button } from "@nextui-org/react";
import Icon from "@/components/elements/icon";
import ContactCreateModal, { switchContactCreateModal } from "@/components/home/contact-create-modal";
import { Navbar, NavbarContent } from "@nextui-org/navbar";
import HomeSearchbar from "@/components/home/home-searchbar";
import PeopleList from "@/components/components/people-list";

export default function ContactsPage() {
    return (
        <div className="w-full h-full relative overflow-y-auto bg-white dark:bg-content1">
            <Navbar
                isBlurred
                isBordered
                className={'pt-10 pb-3'}
            >
                <NavbarContent as="div" className={"items-center w-full"} justify="center">
                    <div className={"w-full"}>
                        <HomeSearchbar />
                    </div>
                </NavbarContent>
            </Navbar >
            <PeopleList className="absolute top-6 pt-[112px]" people={[]} />
            <Button
                color="primary"
                variant="shadow"
                className="fixed bottom-4 left-1/2 -translate-x-1/2 h-10 text-lg"
                radius="full"
                style={{ zIndex: 10 }}
                onPress={() => switchContactCreateModal(true)}
            >
                <Icon name="add" />
                Create new contact
            </Button>
            <ContactCreateModal />
        </div>
    )
}
