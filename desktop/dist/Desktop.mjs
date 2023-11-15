// src/Desktop.tsx
import * as RGL from "react-grid-layout";
import "react-grid-layout/css/styles.css";

// src/AppletHost.tsx
import MwcDriver from "applet-mwc";
import { useEffect, useRef } from "react";
import { Applet, Controls } from "applet-vm";
import { jsx } from "react/jsx-runtime";
var hostLoaded = {};
var unloadAllHosts = () => {
  hostLoaded = {};
};
var Host = (props) => {
  const hostContainerrId = `AppletHost:${props.appletKey}`;
  const appletRef = useRef(new Applet(props.appletKey));
  const rootRef = useRef(null);
  useEffect(() => {
    hostLoaded[props.appletKey] = true;
    appletRef.current.fill(props.code);
    let root = document.getElementById(hostContainerrId);
    if (root !== null) {
      let driver = new MwcDriver(appletRef.current, root);
      driver.start("Test", Controls);
    }
    setTimeout(() => {
      if (rootRef.current !== null) {
        let root2 = rootRef.current;
        root2.style.transform = "scale(1, 1)";
        root2.style.opacity = "1";
      }
    }, (props.index + 1) * 75);
  }, []);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: rootRef,
      id: hostContainerrId,
      style: {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        transform: "scale(0.65, 0.65)",
        opacity: 0,
        transition: "transform .35s"
      }
    }
  );
};
var AppletHost_default = { Host, unloadAllHosts };

// src/Desktop.tsx
import { useState } from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
var ResponsiveReactGridLayout = RGL.WidthProvider(RGL.Responsive);
var desktops = {};
var DesktopData = class {
  constructor() {
    this.layouts = { lg: [], md: [], sm: [], xs: [], xxs: [] };
    this.jsxContent = {};
    this.key = Math.random().toString();
    desktops[this.key] = this;
  }
  fill(layouts, jsxContent) {
    this.jsxContent = jsxContent;
    this.layouts = layouts;
  }
  destroy() {
    delete desktops[this.key];
  }
  addWidget(widget) {
    ["lg", "md", "sm", "xs", "xxs"].forEach((sizeKey) => {
      let y = this.layouts[sizeKey].length > 0 ? Math.max(...this.layouts[sizeKey].filter((item) => {
        return item.x < widget.gridData.w;
      }).map((item) => item.y + item.h)) : 0;
      this.layouts[sizeKey].push({ ...widget.gridData, x: 0, y, i: widget.id });
    });
    this.jsxContent[widget.id] = widget.jsxCode;
    this.layoutCnangeFromCodeCallback && this.layoutCnangeFromCodeCallback(this.layouts);
    this.layoutCnangeFromCodeInternallCallback && this.layoutCnangeFromCodeInternallCallback(this.layouts);
  }
  removeWidget(id) {
    delete this.jsxContent[id];
    ["lg", "md", "sm", "xs", "xxs"].forEach((sizeKey) => {
      this.layouts[sizeKey] = this.layouts[sizeKey].filter((w) => w.i !== id);
    });
    this.layoutCnangeFromCodeCallback && this.layoutCnangeFromCodeCallback(this.layouts);
    this.layoutCnangeFromCodeInternallCallback && this.layoutCnangeFromCodeInternallCallback(this.layouts);
  }
  onLayoutChangeByUI(callback) {
    this.layoutCnangeFromUICallback = callback;
  }
  onLayoutChangeByCode(callback) {
    this.layoutCnangeFromCodeCallback = callback;
  }
  onLayoutChangeByCodeInternally(callback) {
    this.layoutCnangeFromCodeInternallCallback = callback;
  }
  updateLayoutsInternally(layouts, updates) {
    this.layouts = layouts;
    this.layoutCnangeFromUICallback && this.layoutCnangeFromUICallback(layouts, updates);
  }
};
var Host2 = (props) => {
  const [trigger, setTrigger] = useState(false);
  let desktop = desktops[props.desktopKey];
  desktop.onLayoutChangeByCodeInternally((_) => setTrigger(!trigger));
  console.log(desktop.layouts);
  return /* @__PURE__ */ jsx2(
    ResponsiveReactGridLayout,
    {
      className: "layout",
      style: { minWidth: "100%" },
      measureBeforeMount: true,
      useCSSTransforms: false,
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      rowHeight: 30,
      width: props.style.width,
      layouts: structuredClone(desktop.layouts),
      isDraggable: props.editMode,
      isResizable: props.editMode,
      onLayoutChange: (currentLayout, layouts) => {
        let updates = [];
        const oldLayouts = desktop.layouts;
        let clonedLayouts = structuredClone(layouts);
        for (let sizeKey in oldLayouts) {
          let dict = {};
          for (let i = 0; i < oldLayouts[sizeKey].length; i++) {
            let item = oldLayouts[sizeKey][i];
            dict[item.i] = item;
          }
          clonedLayouts[sizeKey].forEach((item) => {
            let oldItem = dict[item.i];
            if (oldItem) {
              if (JSON.stringify(item) !== JSON.stringify(oldItem)) {
                updates.push({ sizeKey, item, __action__: "updated" });
              }
            } else {
              updates.push({ sizeKey, item, __action__: "created" });
            }
          });
        }
        desktop.updateLayoutsInternally(clonedLayouts, updates);
      },
      children: desktop.layouts["lg"].map((item) => item.i).map((key, index) => {
        return /* @__PURE__ */ jsx2("div", { style: { overflow: "hidden", borderRadius: 4 }, children: /* @__PURE__ */ jsx2(AppletHost_default.Host, { appletKey: key, code: desktop.jsxContent[key], index }) }, key);
      })
    }
  );
};
var Desktop_default = {
  Host: Host2,
  DesktopData
};
export {
  Desktop_default as default
};
//# sourceMappingURL=Desktop.mjs.map