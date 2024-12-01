import formatter from "../utils/formatter"
import Api from "../api"
import { OpenWeatherAPI } from "openweather-api-node"

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
        Api.initilize("250adf1e-71aa-4c31-b42f-3ed27563a222-3b4732cb-b147-492a-a2cf-ab1f3931e718").then((api: Api) => {
            const apiKey = 'cbfa9c4664f4dd3a7606424c7022bae3'
            let weather = new OpenWeatherAPI({
                key: apiKey,
                units: "metric",
                coordinates: {
                    lat: 37.2713,
                    lon: 49.5921
                }
            })
            api.services.machine.onRequest(async (packetHolder: any) => {
                console.log('received', packetHolder.packet)
                let { colors, theme } = packetHolder.packet
                if (colors) colors["activeText"] = (theme === 'light' ? '#333' : '#fff');
                if (packetHolder.packet.tag === 'get/url') {
                    packetHolder.answer({ questionId: 'get/url', inside: true, url: '1LSdzuKyef1CtPvHjGsmP8Y0pSVA5PGx4OkC4MT3t-5c' })
                } else if (packetHolder.packet.tag === 'get/applet' || packetHolder.packet.tag === 'get/globalApplet') {
                    let fn = async () => {
                        let data = await weather.getCurrent();
                        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${'rasht'},${'iran'}&units=metric&appid=${apiKey}`);
                        const fetchedData = await response.json();
                        const listByDay = fetchedData.list.filter((day: any) =>
                            day.dt_txt.endsWith("12:00:00")
                        );
                        let foreacst = ''
                        listByDay.forEach((day: any) => {
                            console.log(day)
                            foreacst += `
                                            \n<Box style= {{
                                                width: 'calc(100% - 32px)', height: 250, overflow: 'hidden', marginLeft: 16, marginRight: 16, marginTop: 12, marginBottom: 12, borderRadius: 16,
                                                color: '${colors['activeText']}', position: 'relative', textAlign: 'center', display: 'flex', flexWrap: 'wrap', backgroundColor: '${theme === 'light' ? '#fff' : ('#213037')}'
                                            }}>
                                                <Box style = {{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingTop: 16, width: 'calc(100% - 32px)', height: 250, margin: 16 }}>
                                                    <Box style={{ width: '100%', paddingTop: 4, height: 'auto', textAlign: 'center', transform: 'translateY(-16px)' }}>${day.dt_txt}</Box>
                                                    <Image style = {{ width: 150, height: 150, transform: 'translateY(-24px)' }} src={'http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png'} />
                                                    <Box style={{ transform: 'translateY(-32px)' }}> ${day.main.temp.toFixed()} C </Box>
                                                    <Box style = {{ transform: 'translateY(-24px)' }}> ${day.weather[0].description} </Box>
                                                < /Box>
                                                < Box style = {{ textAlign: 'right', alignItems: 'right', justifyContent: 'right', width: 100, height: 250, position: 'absolute', right: 16, top: 16, paddingTop: 88 }}>
                                                    <Box style={ { fontSize: 13, textAlign: 'center', width: '100%', height: 'auto' } }> Feels Like < /Box>
                                                    < Box style = {{ width: '100%', height: 'auto', textAlign: 'center', marginTop: 8, fontSize: 15 }}> ${day.main.feels_like.toFixed()} C < /Box>
                                                < /Box>
                                                <Box style = {{ textAlign: 'right', alignItems: 'right', justifyContent: 'right', width: 100, height: 250, position: 'absolute', left: 16, top: 16, paddingTop: 64 }}>
                                                    <Box style={ { fontSize: 13, textAlign: 'center', width: '100%', height: 'auto' } }> Humidity < /Box>
                                                    <Box style = {{ width: '100%', height: 'auto', textAlign: 'center', marginTop: 8, fontSize: 15 }}> ${day.main.humidity}% </Box>
                                                    <Box style = {{ marginTop: 24, fontSize: 13, textAlign: 'center', width: '100%', height: 'auto' }}> Wind Speed </Box>
                                                    <Box style = {{ width: '100%', height: 'auto', textAlign: 'center', marginTop: 8, fontSize: 15 }}> ${day.wind.speed} km / h </Box>
                                                </Box>
                                            </Box>
                                `
                        });
                        packetHolder.answer({
                            code: `
                                ${tools}
                                class Test {
                                    constructor() { }
                                    onMount() { }
                                    onUnmount() { }
                                    render() {
                                        return (
                                          <Box style= {{
                                            width: '100%', height: '100%', overflowY: 'auto',
                                            color: '${colors['activeText']}', position: 'relative', textAlign: 'center', containerType: 'size', resize: 'both'
                                          }}>
                                        <Box style={{width: '100%', height: '48', textAlign: 'center', paddingTop: 12 }}>Rasht</Box>  
                                        <Box style={{ width: 'calc(100% - 32px)', height: 250, position: 'relative', marginLeft: 16, marginRight: 16, marginTop: 16, borderRadius: 16, overflow: 'hidden' }}>
                                        <Box style={{
                                                width: '100%', height: '100%', borderRadius: 4,
                                                backgroundColor: '${theme === 'light' ? '#fff' : ('#213037')}', position: 'absolute', left: 0, top: 0,
                                        }} />
                                        <Box style = {{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingTop: 16, width: 'calc(100% - 32px)', height: 250, margin: 16 }}>
                                            <Box style={{ width: '100%', paddingTop: 4, height: 'auto', textAlign: 'center', transform: 'translateY(-16px)' }}>Today</Box>  
                                            <Image style = {{ width: 150, height: 150, transform: 'translateY(-40px)' }} src = { '${data.weather.icon.url}'} />
                                            <Box style={{ transform: 'translateY(-56px)' }}> ${data.weather.temp.cur.toFixed()} C </Box>
                                            <Box style = {{ transform: 'translateY(-48px)' }}> ${data.weather.description} </Box>
                                        </Box>
                                        <Box style = {{ textAlign: 'right', alignItems: 'right', justifyContent: 'right', width: 100, height: 250, position: 'absolute', right: 16, top: 16, paddingTop: 88 }}>
                                            <Box style={ { fontSize: 13, textAlign: 'center', width: '100%', height: 'auto' } }> Feels Like < /Box>
                                            <Box style = {{ width: '100%', height: 'auto', textAlign: 'center', marginTop: 8, fontSize: 15 }}> ${data.weather.feelsLike.cur.toFixed()} C < /Box>
                                        </Box>
                                        <Box style = {{ textAlign: 'right', alignItems: 'right', justifyContent: 'right', width: 100, height: 250, position: 'absolute', left: 16, top: 16, paddingTop: 64 }}>
                                            <Box style={ { fontSize: 13, textAlign: 'center', width: '100%', height: 'auto' } }> Humidity < /Box>
                                            <Box style = {{ width: '100%', height: 'auto', textAlign: 'center', marginTop: 8, fontSize: 15 }}> ${data.weather.humidity}% </Box>
                                            <Box style = {{ marginTop: 24, fontSize: 13, textAlign: 'center', width: '100%', height: 'auto' }}> Wind Speed < /Box>
                                            <Box style = {{ width: '100%', height: 'auto', textAlign: 'center', marginTop: 8, fontSize: 15 }}> ${data.weather.wind.speed} km / h < /Box>
                                        </Box>
                                      </Box>
                                      <Box style={{ width: '100%', height: 'auto' }}>
                                        ${foreacst}
                                      </Box>
                                    </Box>
                                    )
                               }
                            }
                            `})
                    }
                    let tryTheFetch = (count: number) => {
                        if (count > 8) return;
                        fn().catch(ex => {
                            console.log(ex);
                            setTimeout(() => {
                                tryTheFetch(count + 1);
                            }, 1000);
                        })
                    }
                    tryTheFetch(1);
                } else if (packetHolder.packet.tag === 'get/widget') {
                    let fn = async () => {
                        let data = await weather.getCurrent();
                        console.log(data)
                        packetHolder.answer({
                            code: `
                        ${tools}
class Test {
    constructor() { }
    onMount() { }
    onUnmount() { }
    render() {
        return (
            <Box style= {{
            width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', display: 'flex', flexWrap: 'wrap',
                color: '${colors['activeText']}', position: 'relative', backdropFilter: 'blur(5px)', textAlign: 'center', containerType: 'size', resize: 'both'
        }
    }>        
        <Box style={
            {
                width: '100%', height: '100%', borderRadius: 4, display: 'flex', flexWrap: 'wrap',
                    backgroundColor: '${theme === 'light' ? '#fff' : ('#213037')}', position: 'absolute', left: 0, top: 0,
                                        }
} />
    <Box style = {{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingTop: 16, width: 'calc(100% - 32px)', height: 250, margin: 16 }}>
        <Box>Rasht < /Box>
        < Image style = {{ width: 150, height: 150, transform: 'translateY(-24px)' }} src = { '${data.weather.icon.url}'} />
            <Box style={ { transform: 'translateY(-32px)' } }> ${data.weather.temp.cur.toFixed()} C < /Box>
                < Box style = {{ transform: 'translateY(-24px)' }}> ${data.weather.description} </Box>
                    < /Box>
                    < Box style = {{ textAlign: 'right', alignItems: 'right', justifyContent: 'right', width: 100, height: 250, position: 'absolute', right: 16, top: 16, paddingTop: 88 }}>
                        <Box style={ { fontSize: 13, textAlign: 'center', width: '100%', height: 'auto' } }> Feels Like < /Box>
                            < Box style = {{ width: '100%', height: 'auto', textAlign: 'center', marginTop: 8, fontSize: 15 }}> ${data.weather.feelsLike.cur.toFixed()} C < /Box>
                                < /Box>
                                < Box style = {{ textAlign: 'right', alignItems: 'right', justifyContent: 'right', width: 100, height: 250, position: 'absolute', left: 16, top: 16, paddingTop: 64 }}>
                                    <Box style={ { fontSize: 13, textAlign: 'center', width: '100%', height: 'auto' } }> Humidity < /Box>
                                        < Box style = {{ width: '100%', height: 'auto', textAlign: 'center', marginTop: 8, fontSize: 15 }}> ${data.weather.humidity}% </Box>
                                            < Box style = {{ marginTop: 24, fontSize: 13, textAlign: 'center', width: '100%', height: 'auto' }}> Wind Speed < /Box>
                                                < Box style = {{ width: '100%', height: 'auto', textAlign: 'center', marginTop: 8, fontSize: 15 }}> ${data.weather.wind.speed} km / h < /Box>
                                                    < /Box>
                                                    < /Box>
                                )
                           }
                        }
                        ` })
                    }
                    let tryTheFetch = (count: number) => {
                        if (count > 8) return;
                        fn().catch(ex => {
                            console.log(ex);
                            setTimeout(() => {
                                tryTheFetch(count + 1);
                            }, 1000);
                        })
                    }
                    tryTheFetch(1);
                }
            })
        })
    }
}
