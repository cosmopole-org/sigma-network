"use client"

import React, { useState } from 'react';
import MetaTouch, { changeMetaDrawerState } from "./metaTouch";
import Shadow, { showRoomShadow } from "./shadow";

const MainTools = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Shadow onClick={() => {
                setOpen(false);
                changeMetaDrawerState(false);
            }} />
            <MetaTouch room={undefined} needToCloseRecorder={false} onClose={() => {
                setOpen(false);
                showRoomShadow.set(false);
            }} onOpen={() => {
                setOpen(true);
                showRoomShadow.set(true);
            }} />
        </>
    );
}

export default MainTools;
