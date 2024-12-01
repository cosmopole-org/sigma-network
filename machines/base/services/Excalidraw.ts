import Api from "../api"

const tools = `
class Image {
    constructor() {

    }
    onMount() {

    }
    onUnmount() {

    }
    render() {
        return nativeElement('image', this.props, this.styles, this.children)
    }
}
class Box {
constructor() {

}
onMount() {

}
onUnmount() {

}
render() {
    return nativeElement('box', this.props, this.styles, this.children)
}
}
class Text {
constructor() {

}
onMount() {

}
onUnmount() {

}
render() {
    return nativeElement('text', this.props, this.styles, [])
}
}
class Button {
constructor() {

}
onMount() {

}
onUnmount() {

}
render() {
    return nativeElement('button', this.props, this.styles, [])
}
}
class Tabs {
constructor() {

}
onMount() {

}
onUnmount() {

}
render() {
    return nativeElement('tabs', this.props, this.styles, this.children)
}
}
class PrimaryTab {
constructor() {

}
onMount() {

}
onUnmount() {

}
render() {
    return nativeElement('primary-tab', this.props, this.styles, this.children)
}
}
`

let storage: { [id: string]: any[] } = {}

export default {
    start: () => {
        Api.initilize('be79cd38-69cf-4a8e-a435-87ce0ba5f023-d87a70e4-3149-47e7-80f8-50a5d50a2114').then((api: Api) => {
            api.services.machine.onRequest((packetHolder: any) => {
                console.log('received', packetHolder.packet)
                let { colors, theme } = packetHolder.packet
                let workerId = packetHolder.myMemberId;
                if (packetHolder.packet.tag === 'put/element') {
                    let { updatesList } = packetHolder.packet
                    if (!storage[workerId]) storage[workerId] = []
                    let workspace = storage[workerId]
                    updatesList.forEach(update => {
                        update.modifier = packetHolder.userMemberId;
                        let found = false
                        for (let i = 0; i < workspace.length; i++) {
                            if (workspace[i].id === update.id) {
                                found = true
                                workspace[i] = update
                                break
                            }
                        }
                        if (!found) workspace.push(update)
                    });
                    //packetHolder.broadcast({ key: 'update', updatesList })
                } else if (packetHolder.packet.tag === 'get/elements') {
                    if (!storage[workerId]) storage[workerId] = []
                    let workspace = storage[workerId]
                    packetHolder.answer({ questionId: 'get/elements', elements: workspace })
                } else if (packetHolder.packet.tag === 'get/applet' || packetHolder.packet.tag === 'get/globalApplet') {
                    packetHolder.answer({ code: `safezone/excalidraw` })
                } else if (packetHolder.packet.tag === 'get/widget') {
                    packetHolder.answer({
                        code: `
                ${tools}
            class Test {
                constructor() {
                    
                }

                onMount() {
                    
                }
                onUnmount() {
                    
                }
                render() {

                    return (
                        <Box style={{
                            width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden',
                            color: '#000', position: 'relative', textAlign: 'center', backdropFilter: 'blur(5px)',
                            padding: 8, maxHeight: container.width, position: 'relative'
                        }}>
                            <Box style={{
                                width: '100%', height: '100%', borderRadius: 4, display: 'flex', flexWrap: 'wrap',
                                backgroundColor: '${theme === 'light' ? '#fff' : ('#213037')}', position: 'absolute', left: 0, top: 0,
                            }} />
                            <Box style={{
                                position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                                width: '70%',
                                aspectRatio : '1 / 1'        
                            }}
                            >
                            <Image
                                src={'https://safezone.liara.run/excalidraw/logo192.png'}
                                style={{
                                    width: '100%',
                                    height: '100%'
                                }}
                            />
                            </Box>
                        </Box>
                    )
                }
            }
            ` })
                }
            })
        })
    }
}
