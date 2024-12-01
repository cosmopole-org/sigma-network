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
        Api.initilize('150cb03a-0f58-4067-83f2-69c201ed4f8a-3c5d6a16-ae3d-4609-b257-730a59218caf').then((api: Api) => {
            api.services.machine.onRequest((packetHolder: any) => {
                console.log('received', packetHolder.packet)
                let { colors, colorName, secondaryColor, theme, widgetSize } = packetHolder.packet
                if (colors) colors["activeText"] = (theme === 'light' ? '#333' : '#fff');
                // let primaryColor = theme === 'light' ? 'rgba(0, 106, 255, 1)' : 'rgba(0, 255, 170, 1)';
                if (packetHolder.packet.tag === 'get/url') {
                    packetHolder.answer({ questionId: 'get/url', inside: true, url: '1LSdzuKyef1CtPvHjGsmP8Y0pSVA5PGx4OkC4MT3t-5c' }, 'response')
                } else if (packetHolder.packet.tag === 'get/applet' || packetHolder.packet.tag === 'get/globalApplet') {
                    packetHolder.answer({ code: `safezone/codepen` })
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
                                src={'https://safezone.liara.run/codepen/logo192.png'}
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
