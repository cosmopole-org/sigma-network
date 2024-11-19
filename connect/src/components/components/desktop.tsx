
import * as RGL from "react-grid-layout";
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import AppletHost from "./applet-host";
import { useState } from "react";
import IconButton from "../elements/icon-button";
import { Topic } from "../../api/sigma/models";

const ResponsiveReactGridLayout = RGL.WidthProvider(RGL.Responsive);
export const rowHeight = 8
export const columnsDict: { [id: string]: number } = { lg: 14, md: 12, sm: 10, xs: 6, xxs: 4 }
export let sizeKey = window.innerWidth >= 1200 ? 'lg' : window.innerWidth >= 996 ? 'md' : window.innerWidth >= 768 ? 'sm' : window.innerWidth >= 480 ? 'xs' : 'xxs'
window.onresize = () => {
    sizeKey = window.innerWidth >= 1200 ? 'lg' : window.innerWidth >= 996 ? 'md' : window.innerWidth >= 768 ? 'sm' : window.innerWidth >= 480 ? 'xs' : 'xxs'
}

let desktops: { [id: string]: DesktopData } = {}

class DesktopData {
    key: string
    appletKeysStore: { [id: string]: boolean } = {}
    layouts: RGL.Layouts = { lg: [], md: [], sm: [], xs: [], xxs: [] }
    jsxContent: { [id: string]: string } = {}
    layoutCnangeFromUICallback?: (layouts: RGL.Layouts, updates: Array<any>) => void
    layoutCnangeFromCodeCallback?: (layouts: RGL.Layouts) => void
    layoutCnangeFromCodeInternallCallback?: (layouts: RGL.Layouts) => void
    constructor() {
        this.key = Math.random().toString()
        desktops[this.key] = this
    }
    appletExists(id: string) {
        return this.appletKeysStore[id] !== undefined
    }
    clear() {
        this.jsxContent = {}
        this.layouts = { lg: [], md: [], sm: [], xs: [], xxs: [] }
        this.appletKeysStore = {}
        this.layoutCnangeFromCodeCallback && this.layoutCnangeFromCodeCallback(this.layouts)
        this.layoutCnangeFromCodeInternallCallback && this.layoutCnangeFromCodeInternallCallback(this.layouts)
    }
    fill(layouts: RGL.Layouts) {
        this.layouts = layouts
        this.layouts.lg.forEach((w: any) => {
            this.appletKeysStore[w.i] = true;
        })
    }
    destroy() {
        delete desktops[this.key]
    }
    addWidget(widget: { id: string, jsxCode: string, gridData: { w: number, h: number } }, options?: { silent: boolean }) {
        this.appletKeysStore[widget.id] = true;
        (['lg', 'md', 'sm', 'xs', 'xxs']).forEach((sizeKey: string) => {
            let y = this.layouts[sizeKey].length > 0 ?
                Math.max(...this.layouts[sizeKey].filter(item => {
                    return (item.x < widget.gridData.w)
                }).map(item => (item.y + item.h))) :
                0
            this.layouts[sizeKey].push({ ...widget.gridData, x: 0, y, i: widget.id })
        })
        this.jsxContent[widget.id] = widget.jsxCode
        !options?.silent && this.layoutCnangeFromCodeCallback && this.layoutCnangeFromCodeCallback(this.layouts)
        this.layoutCnangeFromCodeInternallCallback && this.layoutCnangeFromCodeInternallCallback(this.layouts)
    }
    updateWidget(workerId: string, jsxCode: string) {
        this.jsxContent[workerId] = jsxCode
        this.layoutCnangeFromCodeInternallCallback && this.layoutCnangeFromCodeInternallCallback(this.layouts)
    }
    removeWidget(id: string) {
        delete this.appletKeysStore[id];
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

const Host = (props: { workersDict: { [id: string]: any }, room: Topic, desktopKey: string, editMode: boolean, style: any, showDesktop: boolean, onWidgetClick: (workerId: string) => void, onWidgetRemove: (workerId: string) => void }) => {
    const [trigger, setTrigger] = useState(false)
    let desktop = desktops[props.desktopKey]
    desktop.onLayoutChangeByCodeInternally((_: RGL.Layouts) => setTrigger(!trigger))
    return (
        <ResponsiveReactGridLayout
            className="layout"
            style={{ ...props.style, minWidth: window.innerWidth + 'px', display: props.showDesktop ? 'block' : 'hidden', paddingBottom: 200 }}
            cols={{ lg: 14, md: 12, sm: 10, xs: 6, xxs: 4 }}
            rowHeight={rowHeight}
            width={props.style.width}
            layouts={structuredClone(desktop.layouts)}
            isDraggable={props.editMode}
            isResizable={props.editMode}
            draggableCancel=".cancelSelectorName"
            draggableHandle=".drag-handle"
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
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
                desktop.layouts[window.innerWidth >= 1200 ? 'lg' : window.innerWidth >= 996 ? 'md' : window.innerWidth >= 768 ? 'sm' : window.innerWidth >= 480 ? 'xs' : 'xxs'].map(item => item.i).map((key, index) => {
                    return (
                        <div key={key} style={{ overflow: 'hidden', borderRadius: 4 }} data-grid={desktop.layouts[window.innerWidth >= 1200 ? 'lg' : window.innerWidth >= 996 ? 'md' : window.innerWidth >= 768 ? 'sm' : window.innerWidth >= 480 ? 'xs' : 'xxs'][index]}>
                            {
                                (props.workersDict[key].machineId === "5c23a6dea8c7e58ec93459e85bb64de8") ? (
                                    <iframe
                                        frameBorder={'none'}
                                        src={props.workersDict[key]?.secret?.frameUrl}
                                        style={{
                                            width: '100%',
                                            height: '100%'
                                        }}
                                    />
                                ) : (
                                    <AppletHost.Host
                                        isWidget
                                        appletKey={key}
                                        onClick={() => (!props.editMode && props.onWidgetClick(key))}
                                        entry={desktop.jsxContent[key] ? 'Test' : 'Dummy'}
                                        code={
                                            desktop.jsxContent[key] ?
                                                desktop.jsxContent[key] :
                                                'class Dummy { constructor() {} onMount() {} render() { return "" } }'
                                        }
                                        index={index}
                                    />
                                )
                            }
                            {
                                props.editMode ? (
                                    <IconButton
                                        name="delete"
                                        size={[16, 16]}
                                        style={{ transform: 'translate(8px, -68px)' }}
                                        onClick={() => props.onWidgetRemove(key)}
                                        className="cancelSelectorName" />
                                ) : null
                            }
                            {
                                props.editMode ? (
                                    <IconButton
                                        name="drag"
                                        size={[16, 16]}
                                        className="drag-handle"
                                        style={{ transform: 'translate(16px, -68px)' }} />
                                ) : null
                            }
                        </div>
                    )
                })
            }
        </ResponsiveReactGridLayout >
    )
}

export default {
    Host,
    DesktopData
}
