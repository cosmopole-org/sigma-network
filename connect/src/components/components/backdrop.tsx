import { Actions, States } from "@/api/client/states";

export default function Backdrop({ stateName, stateChangerName }: Readonly<{ stateName: string, stateChangerName: string }>) {
    const show = States.useListener((States.store as any)[stateName]);
    return show ? (
        <div
            onClick={() => {
                (Actions as any)[stateChangerName](false);
            }}
            style={{
                position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, zIndex: 2
            }}
        >
            <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.25)' }} />
        </div>
    ) : <div style={{ width: 0, height: 0 }} />
}
