
import * as RGL from "react-grid-layout";
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import AppletHost from "./AppletHost";
import { useState } from "react";

const ResponsiveReactGridLayout = RGL.WidthProvider(RGL.Responsive);

let desktops: { [id: string]: DesktopData } = {}

class DesktopData {
    key: string
    layouts: RGL.Layouts = { lg: [], md: [], sm: [], xs: [], xxs: [] }
    jsxContent: { [id: string]: string } = {}
    layoutCnangeFromUICallback?: (layouts: RGL.Layouts, updates: Array<any>) => void
    layoutCnangeFromCodeCallback?: (layouts: RGL.Layouts) => void
    layoutCnangeFromCodeInternallCallback?: (layouts: RGL.Layouts) => void
    constructor() {
        this.key = Math.random().toString()
        desktops[this.key] = this
    }
    fill(layouts: RGL.Layouts, jsxContent: { [id: string]: string }) {
        this.jsxContent = jsxContent
        this.layouts = layouts
    }
    destroy() {
        delete desktops[this.key]
    }
    addWidget(widget: { id: string, jsxCode: string, gridData: { w: number, h: number } }) {
        (['lg', 'md', 'sm', 'xs', 'xxs']).forEach((sizeKey: string) => {
            let y = this.layouts[sizeKey].length > 0 ?
                Math.max(...this.layouts[sizeKey].filter(item => {
                    return (item.x < widget.gridData.w)
                }).map(item => (item.y + item.h))) :
                0
            this.layouts[sizeKey].push({ ...widget.gridData, x: 0, y, i: widget.id })
        })
        this.jsxContent[widget.id] = widget.jsxCode
        this.layoutCnangeFromCodeCallback && this.layoutCnangeFromCodeCallback(this.layouts)
        this.layoutCnangeFromCodeInternallCallback && this.layoutCnangeFromCodeInternallCallback(this.layouts)
    }
    removeWidget(id: string) {
        delete this.jsxContent[id];
        (['lg', 'md', 'sm', 'xs', 'xxs']).forEach((sizeKey: string) => {
            this.layouts[sizeKey] = this.layouts[sizeKey].filter(w => w.i !== id)
        })
        this.layoutCnangeFromCodeCallback && this.layoutCnangeFromCodeCallback(this.layouts)
        this.layoutCnangeFromCodeInternallCallback && this.layoutCnangeFromCodeInternallCallback(this.layouts)
    }
    onLayoutChangeByUI(callback: (layouts: RGL.Layouts, updates: Array<any>) => void) {
        this.layoutCnangeFromUICallback = callback
    }
    onLayoutChangeByCode(callback: (layouts: RGL.Layouts) => void) {
        this.layoutCnangeFromCodeCallback = callback
    }
    onLayoutChangeByCodeInternally(callback: (layouts: RGL.Layouts) => void) {
        this.layoutCnangeFromCodeInternallCallback = callback
    }
    updateLayoutsInternally(layouts: RGL.Layouts, updates: Array<any>) {
        this.layouts = layouts
        this.layoutCnangeFromUICallback && this.layoutCnangeFromUICallback(layouts, updates)
    }
}

const Host = (props: { desktopKey: string, editMode: boolean, style: any }) => {
    const [trigger, setTrigger] = useState(false)
    let desktop = desktops[props.desktopKey]
    desktop.onLayoutChangeByCodeInternally((_: RGL.Layouts) => setTrigger(!trigger))
    console.log(desktop.layouts)
    return (
        <ResponsiveReactGridLayout
            className="layout"
            style={{ minWidth: "100%" }}
            measureBeforeMount={true}
            useCSSTransforms={false}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            width={props.style.width}
            layouts={structuredClone(desktop.layouts)}
            isDraggable={props.editMode}
            isResizable={props.editMode}
            onLayoutChange={(currentLayout: RGL.Layout[], layouts: RGL.Layouts) => {
                let updates: Array<any> = []
                const oldLayouts = desktop.layouts
                let clonedLayouts = structuredClone(layouts)
                for (let sizeKey in oldLayouts) {
                    let dict: { [id: string]: RGL.Layout } = {}
                    for (let i = 0; i < oldLayouts[sizeKey].length; i++) {
                        let item = oldLayouts[sizeKey][i]
                        dict[item.i] = item
                    }
                    clonedLayouts[sizeKey].forEach((item: RGL.Layout) => {
                        let oldItem = dict[item.i]
                        if (oldItem) {
                            if (JSON.stringify(item) !== JSON.stringify(oldItem)) {
                                updates.push({ sizeKey, item, __action__: 'updated' })
                            }
                        } else {
                            updates.push({ sizeKey, item, __action__: 'created' })
                        }
                    })
                }
                desktop.updateLayoutsInternally(clonedLayouts, updates)
            }}
        >
            {
                desktop.layouts['lg'].map(item => item.i).map((key, index) => {
                    return (
                        <div key={key} style={{ overflow: 'hidden', borderRadius: 4 }}>
                            <AppletHost.Host appletKey={key} code={desktop.jsxContent[key]} index={index} />
                        </div>
                    )
                })
            }
        </ResponsiveReactGridLayout>
    );
}

export default {
    Host,
    DesktopData
}
