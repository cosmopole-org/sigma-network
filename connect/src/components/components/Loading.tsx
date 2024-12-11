import { useTheme } from "@/api/client/states"
import { Button, Card, Spinner } from "@nextui-org/react"
import Icon from "../elements/icon";

const Loading = (props: { onCancel: () => void, overlay?: boolean, isWidget?: boolean }) => {
    const { theme } = useTheme();
    let loadingSection = (
        <div style={{ position: 'absolute', width: 'auto', height: 'auto', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ width: 'auto', height: 'auto', position: 'relative', padding: 32, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <Card style={{ width: 56, height: 56, borderRadius: '50%', position: 'absolute', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme === "light" ? '#fff' : '#213037' }}>
                    <Spinner style={{ width: '80%', height: '80%', margin: '10%' }} />
                </Card>
                <div style={{ width: 56, height: 56 }} />
                <p style={{ width: 250, textAlign: 'center', marginTop: 12, color: theme === "light" ? '#333' : '#fff' }}>
                    Connecting to Applet...
                </p>
                <Button
                    style={{ marginTop: 28 }}
                    onPress={() => {
                        props.onCancel()
                    }}
                >
                    <Icon name='close' className='mr-3' />
                    Cancel
                </Button>
            </div>
        </div>
    );
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 }}>
            {
                props.overlay ? (
                    <Card style={{ minWidth: 200, minHeight: 200, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', borderRadius: 24, backgroundColor: theme === "light" ? '#fff' : '#213037' }}>
                        {
                            props.isWidget ? (
                                <div style={{ width: 'auto', height: 'auto', position: 'relative', padding: 32 }}>
                                    <Card style={{ width: 56, height: 56, borderRadius: '50%', position: 'absolute', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme === "light" ? '#fff' : '#213037' }}>
                                        <Spinner style={{ width: '80%', height: '80%', margin: '10%' }} />
                                    </Card>
                                </div>
                            ) : (
                                loadingSection
                            )
                        }
                    </Card>
                ) : (
                    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 200, height: 200 }}>
                        {
                            props.isWidget ? (
                                <div style={{ width: 'auto', height: 'auto', position: 'relative', padding: 32 }}>
                                    <Card style={{ width: 56, height: 56, borderRadius: '50%', position: 'absolute', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme === "light" ? '#fff' : '#213037' }}>
                                        <Spinner style={{ width: '80%', height: '80%', margin: '10%' }} />
                                    </Card>
                                </div>
                            ) : (
                                loadingSection
                            )
                        }
                    </div>
                )
            }
        </div>
    )
}

export default Loading
