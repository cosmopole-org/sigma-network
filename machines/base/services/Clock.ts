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

export default {
    start: () => {
        console.log("starting clock...");
        Api.initilize('d3e0df88-f566-461a-97a4-665cc401ab7c-a2ae7070-7dbf-498f-85c7-fb7599a27ce9').then((api: Api) => {
            api.services.machine.onRequest((packetHolder: any) => {
                console.log(packetHolder.packet)
                if (packetHolder.packet.tag === 'get/applet' || packetHolder.packet.tag === 'get/globalApplet') {
                    let { colors, theme, secondaryColor } = packetHolder.packet
                    colors["activeText"] = (theme === 'light' ? '#333' : '#fff');
                    let handColors = theme === 'light' ? 'rgba(0, 106, 255, 1)' : 'rgba(0, 255, 170, 1)';
                    packetHolder.answer({
                        code: `
                ${tools}
                class Clock {
                    constructor() {
                        this.state = {
                            degree: 0
                        }
                    }
                    onMount() {
                        function changeTimezone(date, ianatz) {
                            let invdate = new Date(date.toLocaleString('en-US', {
                              timeZone: ianatz
                            }));
                            let diff = date.getTime() - invdate.getTime();          
                            let d = date.getTime() - diff
                            return new Date(d);
                        }
                        setInterval(() => {
                            let here = new Date()
                            let date = changeTimezone(here, this.props.timezone)
                            let s = date.getSeconds()
                            let m = date.getMinutes()
                            let h = date.getHours()
                            this.setState({
                                secondsDeg: s * 6 - 90,
                                minutesDeg: m * 6 - 90,
                                hoursDeg: h * 30 - 90
                            })    
                        }, 1000)
                    }
                    onUnmount() {
                        
                    }
                    render() {
                        return (
                            <Box style={{
                                width: '100%', height: 'calc(100% - 16px)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexWrap: 'wrap',
                                color: '#fff', position: 'relative', backdropFilter: 'blur(5px)', textAlign: 'center', containerType: 'size', resize: 'both'
                            }}>
                                <Box style={{
                                    width: '100%', height: '100%', borderRadius: 4, display: 'flex', flexWrap: 'wrap',
                                    backgroundColor: '${theme === 'light' ? '#fff' : ('#213037')}', position: 'absolute', left: 0, top: 0,
                                }} />
                                <Image style={{ borderRadius: '50%', width: '80%', aspectRatio: '1 / 1', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} src={'${theme === 'light' ? 'https://i.postimg.cc/13BzqPpH/clock-3.png' : 'https://i.postimg.cc/SRBTywTF/clock-2.png'}'} />
                                <Box style={{  
                                    transform: 'rotate(' + this.state.hoursDeg + 'deg)',
                                    transition: 'transform 0.5s',
                                    width: '36%', height: '4cqmin', maxHeight: 16, position: 'absolute', left: '32%',
                                    top: '50%'
                                }}>
                                    <Box
                                        style={{
                                            width: '100%', height: '100%', position: 'relative',
                                        }}
                                     >
                                        <Box style={{ borderRadius: '1cqmin', backgroundColor: '${handColors}', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                                    </Box>
                                </Box>
                                <Box style={{  
                                    transform: 'rotate(' + this.state.minutesDeg + 'deg)',
                                    transition: 'transform 0.5s',
                                    width: '50%', height: '3cqmin', maxHeight: 12, position: 'absolute', left: '25%',
                                    top: '50%'
                                }}>
                                    <Box
                                        style={{
                                            width: '100%', height: '100%', position: 'relative',
                                        }}
                                     >
                                        <Box style={{ borderRadius: '1cqmin', backgroundColor: '${handColors}', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                                    </Box>
                                </Box>
                                <Box style={{  
                                    transform: 'rotate(' + this.state.secondsDeg + 'deg)',
                                    transition: 'transform 0.5s',
                                    width: '60%', height: '2cqmin', maxHeight: 8, position: 'absolute', left: '20%',
                                    top: '50%'
                                }}>
                                    <Box
                                        style={{
                                            width: '100%', height: '100%', position: 'relative',
                                        }}
                                     >
                                        <Box style={{ borderRadius: '1cqmin', backgroundColor: '${handColors}', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                                    </Box>
                                </Box>
                            </Box>
                        )
                    }
                }
                class Test {
                    constructor() {}
                    onMount() {}
                    onUnmount() {}
                    render() {
                        return (
                            <Box style={{ width: '100%', height: 'auto', display: 'flex', flexWrap: 'wrap', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                                <Box style={{ width: 'calc(50% - 16px)' , height: container.width / 2, margin: 8 }}>
                                  <Clock timezone={'Asia/Tehran'} />
                                  <Box style={{ marginTop: 8, width: '100%' }}>
                                    <Text text={'Tehran'} style={{ width: '100%', textAlign: 'center', color: '${colors['activeText']}' }} />
                                  </Box>
                                </Box>
                                <Box style={{ width: 'calc(50% - 16px)' , height: container.width / 2, margin: 8 }}>
                                  <Clock timezone={'Asia/Tokyo'} />
                                  <Box style={{ marginTop: 8, width: '100%' }}>
                                    <Text text={'Tokyo'} style={{ width: '100%', textAlign: 'center', color: '${colors['activeText']}' }} />
                                  </Box>
                                </Box>
                                <Box style={{ width: 'calc(50% - 16px)' , height: container.width / 2, margin: 8, marginTop: 24 }}>
                                    <Clock timezone={'America/Toronto'} />
                                    <Box style={{ marginTop: 8, width: '100%' }}>
                                      <Text text={'Toronto'} style={{ width: '100%', textAlign: 'center', color: '${colors['activeText']}' }} />
                                    </Box>
                                </Box>
                                <Box style={{ width: 'calc(50% - 16px)' , height: container.width / 2, margin: 8, marginTop: 24 }}>
                                  <Clock timezone={'Europe/Paris'} />
                                  <Box style={{ marginTop: 8, width: '100%' }}>
                                    <Text text={'Paris'} style={{ width: '100%', textAlign: 'center', color: '${colors['activeText']}' }} />
                                  </Box>
                                </Box>
                            </Box>
                        )
                    }
                }
                    `
                    })
                } else if (packetHolder.packet.tag === 'get/widget') {
                    let { colors, theme, secondaryColor } = packetHolder.packet
                    colors["activeText"] = (theme === 'light' ? '#333' : '#fff');
                    let handColors = theme === 'light' ? 'rgba(0, 106, 255, 1)' : 'rgba(0, 255, 170, 1)';
                    packetHolder.answer({
                        code: `
                ${tools}
            class Test {
                constructor() {
                    this.state = {
                        degree: 0
                    }
                }
                onMount() {
                    setInterval(() => {

                        let date = new Date(Date.now())
                        let s = date.getSeconds()
                        let m = date.getMinutes()
                        let h = date.getHours()
                        this.setState({
                            secondsDeg: s * 6 - 90,
                            minutesDeg: m * 6 - 90,
                            hoursDeg: h * 30 - 90
                        })
                        
                    }, 1000)
                }
                onUnmount() {
                    
                }
                render() {
                    return (
                        <Box style={{
                            backgroundColor: '${theme === 'light' ? '#fff' : ('#213037')}',
                            width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', display: 'flex', flexWrap: 'wrap',
                            color: '#fff', position: 'relative', backdropFilter: 'blur(5px)', textAlign: 'center', containerType: 'size', resize: 'both'
                        }}>
                            <Box style={{
                                width: '100%', height: '100%', borderRadius: 4, display: 'flex', flexWrap: 'wrap',
                                position: 'absolute', left: 0, top: 0, opacity: 0.25,
                            }} />
                            <Image style={{ backgroundColor: '${theme === 'light' ? '#ffffff' : '#0f171b'}', borderRadius: '50%', width: '80%', aspectRatio: '1 / 1', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} src={'${theme === 'light' ? 'https://i.postimg.cc/13BzqPpH/clock-3.png' : 'https://i.postimg.cc/SRBTywTF/clock-2.png'}'} />
                            <Box style={{  
                                transform: 'rotate(' + this.state.hoursDeg + 'deg)',
                                transition: 'transform 0.5s',
                                width: '36%', height: '4cqmin', maxHeight: 16, position: 'absolute', left: '32%',
                                top: '50%'
                            }}>
                                <Box
                                    style={{
                                        width: '100%', height: '100%', position: 'relative',
                                    }}
                                 >
                                    <Box style={{ borderRadius: '2cqmin', backgroundColor: '${handColors}', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                                </Box>
                            </Box>
                            <Box style={{  
                                transform: 'rotate(' + this.state.minutesDeg + 'deg)',
                                transition: 'transform 0.5s',
                                width: '50%', height: '3cqmin', maxHeight: 12, position: 'absolute', left: '25%',
                                top: '50%'
                            }}>
                                <Box
                                    style={{
                                        width: '100%', height: '100%', position: 'relative',
                                    }}
                                 >
                                    <Box style={{ borderRadius: '1.5cqmin', backgroundColor: '${handColors}', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                                </Box>
                            </Box>
                            <Box style={{  
                                transform: 'rotate(' + this.state.secondsDeg + 'deg)',
                                transition: 'transform 0.5s',
                                width: '60%', height: '2cqmin', maxHeight: 8, position: 'absolute', left: '20%',
                                top: '50%'
                            }}>
                                <Box
                                    style={{
                                        width: '100%', height: '100%', position: 'relative',
                                    }}
                                 >
                                    <Box style={{ borderRadius: '1cqmin', backgroundColor: '${handColors}', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                                </Box>
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
