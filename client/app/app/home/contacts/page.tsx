"use client"

import React from "react";
import HomePeopleList from "@/components/home/home-people-list";
import HomeNavbar from "@/components/home/home-navbar";
import { Button } from "@nextui-org/react";
import Icon from "@/components/elements/icon";
import ContactCreateModal, { switchContactCreateModal } from "@/components/home/contact-create-modal";

export default function Contacts() {
    return (
        <div className="w-full relative">
            <HomeNavbar />
            <HomePeopleList />
            <Button
                color="primary"
                variant="shadow"
                className="fixed bottom-[88px] left-2/4 -translate-x-1/2 h-10 text-lg"
                radius="full"
                onClick={() => switchContactCreateModal(true)}
            >
                <Icon name="add" />
                Create new contact
            </Button>
            <ContactCreateModal />
        </div>
    );
}
