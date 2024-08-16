
import { hookstate, useHookstate } from "@hookstate/core"
import { useEffect, useRef, useState } from "react";
import $ from 'jquery';

export let showRoomShadow = hookstate(false);

const Shadow = (props: { onClick: () => void }) => {
    const shadowRef = useRef(null);
    const show = useHookstate(showRoomShadow);
    const [postShow, setPostShow] = useState(false);
    useEffect(() => {
        if (postShow) {
            setTimeout(() => {
                $("#multicanvasArea").removeClass('deactive');
                $("#multicanvasArea").addClass('active');
            }, 0);
        }
    }, [postShow])
    useEffect(() => {
        show.get({ noproxy: true }) ?
            setPostShow(show.get({ noproxy: true })) :
            setTimeout(() => setPostShow(show.get({ noproxy: true })), 250);
    }, [show])
    return postShow ? (
        <div
            id="multicanvasArea"
            ref={shadowRef}
            onClick={() => {
                $("#multicanvasArea").removeClass('active');
                $("#multicanvasArea").addClass('deactive');
                show.set(false);
                props?.onClick();
            }}
            style={{
                position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, zIndex: 2
            }}
            className="deactive"
        >
            <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.25)' }} className={'high-light'} />
        </div>
    ) : <div style={{ width: 0, height: 0 }} />
}

export default Shadow
