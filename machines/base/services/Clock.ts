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
                console.log(packetHolder.data)
                if (packetHolder.data.tag === 'get/applet' || packetHolder.data.tag === 'get/globalApplet') {
                    let { colors } = packetHolder.packet
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
                                    backgroundColor: '${colors['absolutePlain']}', position: 'absolute', left: 0, top: 0, opacity: 0.25,
                                }} />
                                <Image style={{ backgroundColor: '#fff', borderRadius: '50%', width: '80%', aspectRatio: '1 / 1', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} src={'https://illustoon.com/photo/dl/5054.png'} />
                                <Box style={{  
                                    transform: 'rotate(' + this.state.hoursDeg + 'deg) translateY(-50%)',
                                    transition: 'transform 0.5s',
                                    width: '66%', height: '6cqmin', maxHeight: 16, position: 'absolute', left: '16%',
                                    top: '50%'
                                }}>
                                    <Box
                                        style={{
                                            width: '100%', height: '100%', position: 'relative',
                                        }}
                                     >
                                        <Box style={{ backgroundColor: '#000', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                                    </Box>
                                </Box>
                                <Box style={{  
                                    transform: 'rotate(' + this.state.minutesDeg + 'deg) translateY(-50%)',
                                    transition: 'transform 0.5s',
                                    width: '66%', height: '5cqmin', maxHeight: 12, position: 'absolute', left: '16%',
                                    top: '50%'
                                }}>
                                    <Box
                                        style={{
                                            width: '100%', height: '100%', position: 'relative',
                                        }}
                                     >
                                        <Box style={{ backgroundColor: '#000', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                                    </Box>
                                </Box>
                                <Box style={{  
                                    transform: 'rotate(' + this.state.secondsDeg + 'deg) translateY(-50%)',
                                    transition: 'transform 0.5s',
                                    width: '66%', height: '4cqmin', maxHeight: 8, position: 'absolute', left: '16%',
                                    top: '50%'
                                }}>
                                    <Box
                                        style={{
                                            width: '100%', height: '100%', position: 'relative',
                                        }}
                                     >
                                        <Box style={{ backgroundColor: '#000', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
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
                } else if (packetHolder.data.tag === 'get/widget') {
                    let { colors } = packetHolder.data
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
                            width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', display: 'flex', flexWrap: 'wrap',
                            color: '#fff', position: 'relative', backdropFilter: 'blur(5px)', textAlign: 'center', containerType: 'size', resize: 'both'
                        }}>
                            <Box style={{
                                width: '100%', height: '100%', borderRadius: 4, display: 'flex', flexWrap: 'wrap',
                                backgroundColor: '${colors['absolutePlain']}', position: 'absolute', left: 0, top: 0, opacity: 0.25,
                            }} />
                            <Image style={{ backgroundColor: '#fff', borderRadius: '50%', width: '80%', aspectRatio: '1 / 1', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} src={'https://illustoon.com/photo/dl/5054.png'} />
                            <Box style={{  
                                transform: 'rotate(' + this.state.hoursDeg + 'deg) translateY(-50%)',
                                transition: 'transform 0.5s',
                                width: '66%', height: '6cqmin', maxHeight: 16, position: 'absolute', left: '16%',
                                top: '50%'
                            }}>
                                <Box
                                    style={{
                                        width: '100%', height: '100%', position: 'relative',
                                    }}
                                 >
                                    <Box style={{ backgroundColor: '#000', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                                </Box>
                            </Box>
                            <Box style={{  
                                transform: 'rotate(' + this.state.minutesDeg + 'deg) translateY(-50%)',
                                transition: 'transform 0.5s',
                                width: '66%', height: '5cqmin', maxHeight: 12, position: 'absolute', left: '16%',
                                top: '50%'
                            }}>
                                <Box
                                    style={{
                                        width: '100%', height: '100%', position: 'relative',
                                    }}
                                 >
                                    <Box style={{ backgroundColor: '#000', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                                </Box>
                            </Box>
                            <Box style={{  
                                transform: 'rotate(' + this.state.secondsDeg + 'deg) translateY(-50%)',
                                transition: 'transform 0.5s',
                                width: '66%', height: '4cqmin', maxHeight: 8, position: 'absolute', left: '16%',
                                top: '50%'
                            }}>
                                <Box
                                    style={{
                                        width: '100%', height: '100%', position: 'relative',
                                    }}
                                 >
                                    <Box style={{ backgroundColor: '#000', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
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
