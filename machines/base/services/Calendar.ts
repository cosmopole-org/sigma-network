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
        Api.initilize('37004a67-dcb8-4670-a10c-c89de50bfb54-b374b716-65df-47a0-8b8a-b73fccd5574f').then((api: Api) => {
            api.services.machine.onRequest((packetHolder: any) => {
                console.log(packetHolder.packet)
                let { colors, colorName, secondaryColor, theme } = packetHolder.packet
                if (colors) colors["activeText"] = (theme === 'light' ? '#333' : '#fff');
                let primaryColor = theme === 'light' ? 'rgba(0, 106, 255, 1)' : 'rgba(0, 255, 170, 1)';
                if (packetHolder.packet.tag === 'get/applet' || packetHolder.packet.tag === 'get/globalApplet') {
                    packetHolder.answer({
                        code: `
                ${tools}
            class Test {
                constructor() {
                    let date = new Date(Date.now())
                    this.state = {
                        year: date.getFullYear(),
                        month: date.getMonth()
                    }
                }

                onMount() {
                    
                }
                onUnmount() {
                    
                }
                render() {

                    let findDays = (month, year) => {
                        let date = new Date(year, month, 1);
                        let days = [];
                        while (date.getMonth() === month) {
                            days.push(new Date(date));
                            date.setDate(date.getDate() + 1);
                        }
                        return days;
                    }

                    let days = findDays(this.state.month, this.state.year)

                    let firstDayOfMonth = days[0].getDay()

                    let daysBeforeStart = []
                    for (let i = 0; i < firstDayOfMonth + 1; i++) {
                        daysBeforeStart.push({})
                    }
                    let daysAfterEnd = []
                    let lastDayOfMonth = days[days.length - 1].getDay()
                    for (let i = lastDayOfMonth + 2; i < 7; i++) {
                        daysAfterEnd.push({})
                    }

                    const monthNames = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];

                    const ds = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                    let today = (new Date()).getDate() - 1
              
                    return (
                        <Box style={{
                            width: 'calc(100% - 48px)', height: 'calc(100% - 48px)', borderRadius: 16, overflow: 'hidden',
                            color: '#000', position: 'relative', textAlign: 'center', backdropFilter: 'blur(5px)',
                            padding: 8, maxHeight: container.width - 48, margin: 16, containerType: 'size', resize: 'both'
                        }}>
                            <Box style={{
                                width: '100%', height: '100%', borderRadius: 4, display: 'flex', flexWrap: 'wrap',
                                backgroundColor: '${colors['absolutePlain']}', position: 'absolute', left: 0, top: 0, opacity: 0.25
                            }} />
                            <Box style={{ width: '100%', position: 'absolute', top: 20, left: 0, display: 'flex' }}>
                                <Box style={{maxWidth: 56, width: '10%', height: 0}} />
                                <Text text={'<-'} style={{ width: 'auto', textAlign: 'center', color: '${colors['activeText']}', fontSize: '7cqmin' }} />
                                <Text text={this.state.year + ' ' + monthNames[this.state.month]} style={{ flex: 1, textAlign: 'center', color: '${colors['activeText']}', fontSize: '7cqmin' }} />
                                <Text text={'->'} style={{ width: 'auto', textAlign: 'center', color: '${colors['activeText']}', fontSize: '7cqmin' }} />
                                <Box style={{maxWidth: 56, width: '10%', height: 0}} />
                            </Box>
                            <Box style={{ width: '100%', height: 56 }} />
                            <Box style={{width: '100%', height: 'calc(100% - 64px)', display: 'flex', flexWrap: 'wrap'}}>
                            {
                                ds.map(day => {
                                    return (
                                    <Box style={{ borderRadius: '25%', marginLeft: 8, marginRight: 8, width: 'calc(${100 / 7}% - 17px)', aspectRatio : '1 / 1', position: 'relative' }}>
                                        <Box style={{ borderRadius: '25%', paddingTop: 6, width: '100%', height:'calc(100% - 16px)', position: 'relative', color: '${colors['activeText']}', fontSize: 13 }}>
                                          {day} 
                                        </Box>
                                    </Box>
                                    )
                                })
                            }
                            {
                                daysBeforeStart.map(day => {
                                    return (
                                    <Box style={{ borderRadius: '25%', marginLeft: 8, marginRight: 8, width: 'calc(${100 / 7}% - 17px)', aspectRatio : '1 / 1', position: 'relative' }}>
                                        <Box style={{ borderRadius: '25%', paddingTop: 6, width: '100%', height:'calc(100% - 16px)', position: 'relative', color: '${colors['activeText']}' }}>
                                           
                                        </Box>
                                    </Box>
                                    )
                                })
                            }
                            {
                                days.map((day, index) => {
                                    return (
                                        <Box style={{ borderRadius: '25%', marginLeft: 8, marginRight: 8, width: 'calc(${100 / 7}% - 17px)', aspectRatio: '1 / 1', position: 'relative' }}>
                                            <Box style={{ backgroundColor: today === index ? '${primaryColor}' : 'transparent', borderRadius: '50%', width: '70%', padding: '15%', aspectRatio: '1 / 1', position: 'relative', fontSize: '5cqmin', color: today === index ? '${theme === 'light' ? '#fff7' : '#21303777'}' : '${colors['activeText']}' }}>
                                                {day.getDate()}
                                            </Box>
                                        </Box>
                                    )
                                })
                            }
                            {
                                daysAfterEnd.map(day => {
                                    return (
                                    <Box style={{ borderRadius: '25%', marginLeft: 8, marginRight: 8, width: 'calc(${100 / 7}% - 17px)', aspectRatio : '1 / 1', position: 'relative' }}>
                                        <Box style={{ borderRadius: '25%', paddingTop: 6, width: '100%', height: 'calc(100% - 16px)', position: 'relative', color: '${colors['activeText']}' }}>
                               
                                        </Box>
                                    </Box>
                                    )
                                })
                            }
                            </Box>
                        </Box>
                    )
                }
            }
            ` })
                } else if (packetHolder.packet.tag === 'get/widget') {
                    packetHolder.answer({
                        code: `
                ${tools}
            class Test {
                constructor() {
                    let date = new Date(Date.now())
                    this.state = {
                        year: date.getFullYear(),
                        month: date.getMonth()
                    }
                }

                onMount() {
                    
                }
                onUnmount() {
                    
                }
                render() {

                    let findDays = (month, year) => {
                        let date = new Date(year, month, 1);
                        let days = [];
                        while (date.getMonth() === month) {
                            days.push(new Date(date));
                            date.setDate(date.getDate() + 1);
                        }
                        return days;
                    }

                    let days = findDays(this.state.month, this.state.year)

                    let firstDayOfMonth = days[0].getDay()

                    let daysBeforeStart = []
                    for (let i = 0; i < firstDayOfMonth + 1; i++) {
                        daysBeforeStart.push({})
                    }
                    let daysAfterEnd = []
                    let lastDayOfMonth = days[days.length - 1].getDay()
                    for (let i = lastDayOfMonth + 2; i < 7; i++) {
                        daysAfterEnd.push({})
                    }

                    const monthNames = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];

                    const ds = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                    let today = (new Date()).getDate() - 1
              
                    return (
                        <Box style={{
                            width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden',
                            color: '#000', position: 'relative', textAlign: 'center', backdropFilter: 'blur(5px)',
                            padding: 8, maxHeight: container.width, containerType: 'size', resize: 'both'
                        }}>
                            <Box style={{
                                width: '100%', height: '100%', borderRadius: 4, display: 'flex', flexWrap: 'wrap',
                                backgroundColor: '${theme === 'light' ? '#fff7' : '#21303777'}', position: 'absolute', left: 0, top: 0,
                            }} />
                            <Box style={{ width: '100%', height: 'auto', position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}> 
                                <Box style={{ width: '85%', marginTop: '5%', marginLeft: '7.5%' }}>
                                    <Text text={this.state.year + ' ' + monthNames[this.state.month]} style={{ flex: 1, textAlign: 'center', color: '${colors['activeText']}', fontSize: '18cqmin' }} />
                                </Box>
                                <Text text={today + 1} style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center', verticalAlign: 'middle', width: '100%', display: 'flex', color: '${colors['activeText']}', fontSize: '28cqmin'}} />
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
