import { Actions, States, useTheme } from "@/api/client/states"
import { Button, Card, colors, Spinner } from "@nextui-org/react"
import Icon from "../elements/icon"

const LoadingOverlay = () => {
    const { theme } = useTheme();
    const fetchingOverlay = States.useListener(States.store.loadingOverlay);
    return fetchingOverlay ? (
        <div style={{ width: '100%', height: '100%', position: 'fixed', left: 0, top: 0, zIndex: 99999 }}>
            <div style={{
                width: '100%', height: '100%', position: 'fixed', left: 0, top: 0,
                backgroundColor: colors.blue[200],
                opacity: 0.35, transition: 'opacity 500ms'
            }} />
            <Card style={{ minWidth: 200, minHeight: 200, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', borderRadius: 24, backgroundColor: theme === "light" ? '#fff' : '#213037' }}>
                <div style={{ position: 'absolute', width: 'auto', height: 'auto', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ width: 'auto', height: 'auto', position: 'relative', padding: 32, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <Card style={{ width: 56, height: 56, borderRadius: '50%', position: 'absolute', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme === "light" ? '#fff' : '#213037' }}>
                            <Spinner style={{ width: '80%', height: '80%', margin: '10%' }} />
                        </Card>
                        <div style={{ width: 56, height: 56 }} />
                        <p style={{ width: 250, textAlign: 'center', marginTop: 12, color: theme === "light" ? '#333' : '#fff' }}>
                            Asking Bot...
                        </p>
                        <Button
                            style={{ marginTop: 28 }}
                            onPress={() => {
                                let currentAppletData = States.store.currentAppletData.get({ noproxy: true });
                                Actions.switchAppletLoaded(false)
                                Actions.switchAppletShown(false)
                                if (currentAppletData) {
                                    let appletId = currentAppletData.id;
                                    Actions.closeApplet(appletId);
                                    (window as any).closeAppletSheet('safezone-desktop-sheet-' + appletId);
                                }
                            }}
                        >
                            <Icon name='close' className='mr-3' />
                            Cancel
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    ) : null
}

export default LoadingOverlay
