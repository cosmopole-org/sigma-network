"use client"

import React from 'react';
import MetaTouch, { changeMetaDrawerState } from "./metaTouch";
import Shadow, { showRoomShadow } from "./shadow";

const MainTools = () => {
    return (
        <>
            <Shadow onClick={() => {
                changeMetaDrawerState(false);
            }} />
            <MetaTouch room={undefined} needToCloseRecorder={false} onClose={() => {
                showRoomShadow.set(false);
            }} onOpen={() => {
                showRoomShadow.set(true);
            }} />
        </>
    );
}

export default MainTools;
