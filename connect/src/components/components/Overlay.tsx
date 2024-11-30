import { State, hookstate, useHookstate } from "@hookstate/core"
import AppletHost from "./applet-host"
import { IconButton } from "@mui/material"
import { Close } from "@mui/icons-material"
import useSafezone from "./useSafezone"
import { colors } from "@nextui-org/theme"

export const overlaySafezoneData: State<any> = hookstate(undefined)

const Overlay = () => {
    const overlaySafezone = useHookstate(overlaySafezoneData).get({ noproxy: true })
    const safezoneRepo = useSafezone()
    if (overlaySafezone?.workerId && !safezoneRepo.accessSafeZoneController().findById(overlaySafezone.workerId)) {
        safezoneRepo.accessSafeZoneController().create({ id: overlaySafezone.workerId })
    }
    const ready = useHookstate(safezoneRepo.accessSafeZoneController().findById(overlaySafezone?.workerId)?.ready)?.get({ noproxy: true })
    return (
        <div style={{ width: '100%', height: '100%', position: 'fixed', left: 0, top: 0, zIndex: 99999 }}>
            <div style={{
                width: '100%', height: '100%', position: 'fixed', left: 0, top: 0,
                backgroundColor: colors.blue[200],
                opacity: 0.35, transition: 'opacity 500ms'
            }} />
            <AppletHost.Host
                overlay={true}
                appletKey={overlaySafezoneData.get({ noproxy: true }).workerId}
                code={overlaySafezoneData.get({ noproxy: true }).code}
                room={overlaySafezoneData.get({ noproxy: true }).room}
                index={0}
                entry={'Test'}
                onCancel={() => {
                    overlaySafezoneData.set(undefined)
                }}
            />
            {
                ready ? (
                    <IconButton
                        onClick={() => overlaySafezoneData.set(undefined)}
                        style={{ position: 'absolute', top: 16, right: 16, borderRadius: '50%', backgroundColor: colors.blue[50] }}
                    >
                        <Close />
                    </IconButton>
                ) : null
            }
        </div>
    )
}

export default Overlay
