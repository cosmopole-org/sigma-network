import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Desktop from './Desktop';
import ReactGridLayout from 'react-grid-layout';
import * as RGL from 'react-grid-layout';

let code = `
class Box {
    constructor() {

    }
    onMount() {

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
    render() {
        return nativeElement('text', this.props, this.styles, [])
    }
}
class Button {
    constructor() {

    }
    onMount() {

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
    render() {
        return nativeElement('tabs', this.props, this.styles, this.children)
    }
}
class PrimaryTab {
    constructor() {

    }
    onMount() {

    }
    render() {
        return nativeElement('primary-tab', this.props, this.styles, this.children)
    }
}
class Test {
    constructor() {
        console.log(window)
    }
    onMount() {

    }
    render() {
        return (
            <Box style={{ width: 100, height: 100 }}>
                
            </Box>
        )
    }
}
`

const getJsxContent = () => {
    let jsxContent = localStorage.getItem('jsxContent')
    if (jsxContent !== null) {
        return JSON.parse(jsxContent)
    } else {
        return {}
    }
}

const saveJsxContent = (jsxContent: { [id: string]: string }) => {
    localStorage.setItem('jsxContent', JSON.stringify(jsxContent))
}

const getLayouts = () => {
    let gridStr = localStorage.getItem('grid')
    if (gridStr !== null) {
        console.log(JSON.parse(gridStr))
        return JSON.parse(gridStr)
    } else {
        return { lg: [], md: [], sm: [], xs: [], xxs: [] }
    }
}

const saveLayouts = (layouts: ReactGridLayout.Layouts) => {
    localStorage.setItem('grid', JSON.stringify(layouts))
}

let codes: { [id: string]: string } = getJsxContent()
const desktop = new Desktop.DesktopData()
desktop.fill(getLayouts(), getJsxContent())
desktop.onLayoutChangeByUI((layouts: RGL.Layouts, updates: Array<any>) => {
    saveLayouts(layouts)
})
desktop.onLayoutChangeByCode((layouts: RGL.Layouts) => {
    saveLayouts(layouts)
})

function App() {
    const [desktopWidth, setDesktopWidth] = useState(window.innerWidth)
    useEffect(() => {
        window.addEventListener('resize', e => {
            setDesktopWidth(window.innerWidth)
        })
    }, [])
    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', background: `url(https://svgur.com/i/jyv.svg)` }}>
            <Desktop.Host
                desktopKey={desktop.key}
                style={{ width: desktopWidth }}
                editMode={false}
            />
            <button style={{ position: 'fixed', right: 16, bottom: 16, fontSize: 25 }} onClick={() => {
                let id = Math.random().toString();
                codes[id] = code;
                saveJsxContent(codes);
                desktop.addWidget({ id, jsxCode: code, gridData: { w: 8, h: 6 } })
            }}>add</button>
        </div>
    );
}

export default App;
