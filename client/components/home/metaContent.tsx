import { useRef } from "react";
import { hookstate, useHookstate } from "@hookstate/core";
import { Card } from "@nextui-org/react";

export const metaActiveTab = hookstate('chat')

const MetaContent = (props: { room: any, needToCloseRecorder?: boolean }) => {
    const wallpaperContainerRef = useRef(null);
    const activeTab = useHookstate(metaActiveTab);
    return (
        <Card className="overflow-hidden w-full h-full bg-white">
            <div
                style={{
                    height: 'calc(100% - 48px)'
                }}
            >
                <div style={{
                    position: 'relative', width: '100%', height: '100%', zIndex: 2
                }}>
                    {
                        activeTab.get({ noproxy: true }) !== 'files' ?
                            [
                                <div key={'room-background'} style={{ borderRadius: '24px 24px 0px 0px', width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 }} ref={wallpaperContainerRef} />,
                                <div key={'room-background-overlay'} style={{
                                    backgroundColor: '#fff',
                                    width: '100%', height: '100%', position: 'absolute', left: 0, top: 0
                                }} />
                            ] :
                            [
                                <div key={'room-background-blank'} style={{ borderRadius: '24px 24px 0px 0px', backgroundColor: '#eee', width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 }} />
                            ]
                    }
                    <div style={{ width: '100%', height: `100%` }}>
              
                    </div>
                    <div
                        style={{
                            width: '100%', height: 'auto', position: 'absolute', left: 0, top: 0, backgroundColor: '#fff',
                            borderRadius: '24px 24px 0px 0px'
                        }}
                    >
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default MetaContent
