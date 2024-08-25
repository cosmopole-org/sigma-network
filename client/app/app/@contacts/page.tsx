"use client"

import React from "react";
import HomePeopleList from "@/components/home/home-people-list";
import HomeNavbar from "@/components/home/home-navbar";
import { Button } from "@nextui-org/button";
import Icon from "@/components/elements/icon";
import ContactCreateModal, { switchContactCreateModal } from "@/components/home/contact-create-modal";
import { Navbar, NavbarContent } from "@nextui-org/navbar";
import HomeSearchbar from "@/components/home/home-searchbar";

export default function ContactsPage() {
    return (
        <div className="w-full h-full relative overflow-y-auto bg-white dark:bg-content1">
            <Navbar
                isBordered
                className={'bg-content1 pt-10 pb-3'}
            >
                <NavbarContent as="div" className={"items-center w-full"} justify="center">
                    <div className={"w-full"}>
                        <HomeSearchbar />
                    </div>
                </NavbarContent>
            </Navbar >
            <HomePeopleList />
            <div className="sticky bottom-[16px] h-10">
                <Button
                    color="primary"
                    variant="shadow"
                    className="absolute left-1/2 -translate-x-1/2 h-10 text-lg"
                    radius="full"
                    onClick={() => switchContactCreateModal(true)}
                >
                    <Icon name="add" />
                    Create new contact
                </Button>
            </div>
            <ContactCreateModal />
        </div>
    )
}
