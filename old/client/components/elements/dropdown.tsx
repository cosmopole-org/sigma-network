'use client'

import React from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import Icon from "./icon";

export default function DropDownBox() {
    const [selectedKeys, setSelectedKeys] = React.useState(new Set(["text"]) as any);
    
    const selectedValue = React.useMemo(
        () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
        [selectedKeys]
    );

    return (
        <Dropdown backdrop="blur">
            <DropdownTrigger>
                <Button
                    variant="bordered"
                    className="capitalize"
                    endContent={<Icon name="dropdown" size={[12, 12]} />}
                >
                    <p className="mr-2">{selectedValue}</p>
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Single selection example"
                variant="flat"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            >
                <DropdownItem key="text">Text</DropdownItem>
                <DropdownItem key="number">Number</DropdownItem>
                <DropdownItem key="date">Date</DropdownItem>
                <DropdownItem key="single_date">Single Date</DropdownItem>
                <DropdownItem key="iteration">Iteration</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}
