"use client"

import {add} from '@/public/applet/release';

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
}global
`

const clockWidgetData = `
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
                <Image style={{ backgroundColor: '#fff', borderRadius: '50%', width: '80%', aspectRatio: '1 / 1', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} src={'https://illustoon.com/photo/dl/5054.png'} />
                <Box style={{  
                    transform: 'rotate(' + this.state.hoursDeg + 'deg) translateY(-50%)',
                    transition: 'transform 0.5s',
                    width: '66%', height: '4cqmin', maxHeight: 16, position: 'absolute', left: '16%',
                    top: '50%'
                }}>
                    <Box
                        style={{
                            width: '100%', height: '100%', position: 'relative'
                        }}
                     >
                        <Box style={{ backgroundColor: '#000', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                    </Box>
                </Box>
                <Box style={{  
                    transform: 'rotate(' + this.state.minutesDeg + 'deg) translateY(-50%)',
                    transition: 'transform 0.5s',
                    width: '66%', height: '3cqmin', maxHeight: 12, position: 'absolute', left: '16%',
                    top: '50%'
                }}>
                    <Box
                        style={{
                            width: '100%', height: '100%', position: 'relative'
                        }}
                     >
                        <Box style={{ backgroundColor: '#000', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                    </Box>
                </Box>
                <Box style={{  
                    transform: 'rotate(' + this.state.secondsDeg + 'deg) translateY(-50%)',
                    transition: 'transform 0.5s',
                    width: '66%', height: '2cqmin', maxHeight: 8, position: 'absolute', left: '16%',
                    top: '50%'
                }}>
                    <Box
                        style={{
                            width: '100%', height: '100%', position: 'relative'
                        }}
                     >
                        <Box style={{ backgroundColor: '#000', width: '50%', height: '100%', position: 'absolute', left: '50%' }} />
                    </Box>
                </Box>
            </Box>
        )
    }
}
`;

export async function runWasm() {
    console.log(add(1, 2));
    // const res = await fetch("/applet.wasm");
    // const buffer = await res.arrayBuffer();
    // const wasm = await WebAssembly.instantiate(buffer, {module: {}, env: {}});
    // console.log(wasm);
    // const run: any = wasm.instance.exports.run;
    // console.log(run);
    // run("sample", "Test", `${tools} ${clockWidgetData}`);
}
