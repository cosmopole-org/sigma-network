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
        Api.initilize('6d5f1d7912fa6cbe3602c2502e56c96d').then((api: Api) => {
            api.services.machine.onRequest((packetHolder: any) => {
                console.log('received', packetHolder.packet)
                let { colors, colorName, secondaryColor } = packetHolder.packet
                if (packetHolder.packet.tag === 'get/url') {
                    packetHolder.answer({ questionId: 'get/url', inside: true, url: '1LSdzuKyef1CtPvHjGsmP8Y0pSVA5PGx4OkC4MT3t-5c' }, 'response')
                } else if (packetHolder.packet.tag === 'get/applet' || packetHolder.packet.tag === 'get/globalApplet') {
                    packetHolder.answer({ code: `safezone/spotify` })
                } else if (packetHolder.packet.tag === 'get/widget') {
                    packetHolder.answer({
                        code: `safezone/<iframe style="border-radius:16px; width: 200px; height: 480px" src="https://open.spotify.com/embed/track/2J2Z1SkXYghSajLibnQHOa?utm_source=generator" width="200" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`
                    })
                }
            })
        })
    }
}
