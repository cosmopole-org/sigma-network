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
class Frame {
constructor() {

}
onMount() {

}
onUnmount() {

}
render() {
    return nativeElement('frame', this.props, this.styles, this.children)
}
}
`

let storage: { [id: string]: any[] } = {}

export default {
    start: () => {
        Api.initilize('861f187bb4a8ce6a40a16f677e39cac3').then((api: Api) => {
            api.services.machine.onRequest((packetHolder: any) => {
                console.log('received', packetHolder.packet)
                let { colors, colorName, secondaryColor } = packetHolder.packet
                if (packetHolder.packet.tag === 'get/url') {
                    packetHolder.answer({ questionId: 'get/url', inside: true, url: '1LSdzuKyef1CtPvHjGsmP8Y0pSVA5PGx4OkC4MT3t-5c' }, 'response')
                } else if (packetHolder.packet.tag === 'get/applet' || packetHolder.packet.tag === 'get/globalApplet') {
                    packetHolder.answer({ code: `safezone/googledocs` })
                } else if (packetHolder.packet.tag === 'get/widget') {
                    packetHolder.answer({
                        onClick: { code: `safezone/gdrive`, overlay: true },
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
                        <Frame
                            width={'100%'}
                            height={'100%'}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: 16
                            }}
                            src={'https://calendar.google.com/calendar/embed?src=hawkcosmopolitan%40gmail.com&ctz=UTC'}
                        />
                    )
                }
            }
            ` })
                }
            })
        })
    }
}
