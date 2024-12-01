import { useTheme } from "@/api/client/states"
import { Close } from "@mui/icons-material"
import { Button, Card, colors, Spinner } from "@nextui-org/react"

const Loading = (props: { onCancel: () => void, overlay?: boolean, isWidget?: boolean }) => {
    const { theme } = useTheme();
    return (
        <div style={{ width: '100%', height: '100%', position: 'fixed', left: 0, top: 0 }}>
            {
                props.overlay ? (
                    <Card style={{ position: 'absolute', left: '50%', top: 'calc(50% - 16px)', transform: 'translate(-50%, -50%)', borderRadius: 24, backgroundColor: theme === "light" ? '#fff' : '#213037' }}>
                        {
                            props.isWidget ? (
                                <div style={{ width: 'auto', height: 'auto', position: 'relative', padding: 32 }}>
                                    <Card style={{ width: 56, height: 56, borderRadius: '50%', position: 'absolute', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme === "light" ? '#fff' : '#213037' }}>
                                        <Spinner style={{ width: '80%', height: '80%', margin: '10%' }} />
                                    </Card>
                                </div>
                            ) : (
                                <div style={{ width: 'auto', height: 'auto', position: 'relative', padding: 32 }}>
                                    <Card style={{ width: 56, height: 56, borderRadius: '50%', position: 'absolute', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme === "light" ? '#fff' : '#213037' }}>
                                        <Spinner style={{ width: '80%', height: '80%', margin: '10%' }} />
                                    </Card>
                                    <div style={{ width: 56, height: 56 }} />
                                    <p style={{ width: '100%', textAlign: 'center', marginTop: 12, color: theme === "light" ? '#333' : '#fff' }}>
                                        Loading Applet...
                                    </p>
                                    <Button
                                        style={{ marginTop: 32 }}
                                        onClick={() => {
                                            props.onCancel()
                                        }}
                                    >
                                        <Close style={{ marginRight: 12 }} />
                                        Cancel
                                    </Button>
                                </div>
                            )
                        }
                    </Card>
                ) : (
                    <div style={{ position: 'absolute', left: '50%', top: 'calc(50% - 16px)', transform: 'translate(-50%, -50%)' }}>
                        <div style={{ width: 'auto', height: 'auto', position: 'relative', padding: 32 }}>
                            {
                                props.isWidget ? (
                                    <div style={{ width: 'auto', height: 'auto', position: 'relative', padding: 32 }}>
                                        <Card style={{ width: 56, height: 56, borderRadius: '50%', position: 'absolute', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme === "light" ? '#fff' : '#213037' }}>
                                            <Spinner style={{ width: '80%', height: '80%', margin: '10%' }} />
                                        </Card>
                                    </div>
                                ) : (
                                    <div style={{ width: 'auto', height: 'auto', position: 'relative', padding: 32 }}>
                                        <Card style={{ width: 56, height: 56, borderRadius: '50%', position: 'absolute', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme === "light" ? '#fff' : '#213037' }}>
                                            <Spinner style={{ width: '80%', height: '80%', margin: '10%' }} />
                                        </Card>
                                        <div style={{ width: 56, height: 56 }} />
                                        <p style={{ width: '100%', textAlign: 'center', marginTop: 12, color: theme === "light" ? '#333' : '#fff' }}>
                                            Loading Applet...
                                        </p>
                                        <Button
                                            style={{ marginTop: 32 }}
                                            onClick={() => {
                                                props.onCancel()
                                            }}
                                        >
                                            <Close style={{ marginRight: 12 }} />
                                            Cancel
                                        </Button>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default Loading
