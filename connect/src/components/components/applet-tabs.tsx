import { Actions, States } from "@/api/client/states";
import { useEffect } from "react";
import { appletCache } from "./applet-host";

let overlays: { [id: string]: HTMLDivElement } = {};

const AppletTabs = () => {
    const minimizedApplets = States.useListener(States.store.minimizedApplets);
    const showTabs = States.useListener(States.store.showAppletTabs);
    useEffect(() => {
        let frameEl = document.getElementById("frames");
        let framesListEl = document.getElementById("framesList");
        if (showTabs) {
            let stageSlot = document.getElementById('frameTabsStage');
            if (stageSlot) stageSlot.style.display = 'none';
            if (framesListEl) {
                let children: HTMLElement[] = [];
                for (var i = 0; i < framesListEl.children.length; i++) {
                    children.push(framesListEl.children[i] as HTMLElement); 
                }
                for (var i = 0; i < children.length; i++) {
                    let appletKey = children[i].id.substring("safezone-desktop-sheet-".length);
                    let el = children[i];
                    if (el instanceof HTMLIFrameElement) {
                        el.slot = 'frameTabs';
                        el.style.marginLeft = (window.innerWidth * 15 / 4 / 100) + 'px';
                        el.style.minWidth = (window.innerWidth * 85 / 100) + 'px';
                        el.style.borderRadius = '24px';
                        el.style.pointerEvents = 'none';
    
                        let overlay = document.createElement('div');
                        overlay.style.minWidth = (window.innerWidth * 85 / 100) + 'px';
                        overlay.style.height = (window.innerHeight * 85 / 100) + 'px';
                        overlay.style.marginRight = (window.innerWidth * 15 / 4 / 100) + 'px';
                        overlay.style.marginLeft = '-' + (window.innerWidth * 85 / 100) + 'px';
                        overlay.onclick = () => {
                            Actions.switchAppletTabs(false);
                            setTimeout(() => {
                                Actions.restoreApplet(appletKey);                                
                            }, 250);
                        }
                        overlays[appletKey] = overlay;

                        el.parentNode?.insertBefore(overlay, el.nextSibling);
                        overlay.slot = 'frameTabs';
                    }
                }
            }
            Object.keys(appletCache).forEach(appletKey => {
                let el = appletCache[appletKey].element;
                if (el instanceof HTMLDivElement) {
                    el.style.marginLeft = (window.innerWidth * 15 / 4 / 100) + 'px';
                    el.style.marginRight = (window.innerWidth * 15 / 4 / 100) + 'px';
                    el.style.minWidth = (window.innerWidth * 85 / 100) + 'px';
                    el.style.borderRadius = '24px';
                    el.style.pointerEvents = 'none';
                  
                    let container = document.createElement('div');
                    container.style.marginLeft = (window.innerWidth * 15 / 4 / 100) + 'px';
                    container.style.marginRight = (window.innerWidth * 15 / 4 / 100) + 'px';
                    container.style.minWidth = (window.innerWidth * 85 / 100) + 'px';
                    container.onclick = () => {
                        Actions.switchAppletTabs(false);
                        setTimeout(() => {
                            Actions.restoreApplet(appletKey.substring("desktop-sheet-".length));                                
                        }, 250);
                    }
                    container.appendChild(el);

                    overlays[appletKey] = container;
                    
                    framesListEl?.appendChild(container);
                    container.slot = "frameTabs";
                }
            });
            if (frameEl) frameEl.style.transform = 'translate(0px, 0%)';
        } else {
            let stageSlot = document.getElementById('frameTabsStage');
            if (stageSlot) stageSlot.style.display = 'block';
            Object.keys(minimizedApplets).forEach(appletKey => {
                let el = document.getElementById("safezone-desktop-sheet-" + appletKey);
                if (el instanceof HTMLIFrameElement) {
                    el.slot = 'frameStore';
                    el.style.marginLeft = '0px';
                    el.style.marginRight = '0px';
                    el.style.minWidth = '0px';
                    el.style.borderRadius = '0px';
                    el.style.pointerEvents = 'auto';

                    let overlay = overlays[appletKey];
                    overlay.remove();
                    
                    el.style.display = 'block';
                }
            });
            Object.keys(appletCache).forEach(appletKey => {
                let el = appletCache[appletKey].element;
                if (el instanceof HTMLDivElement) {
                    el.slot = 'frameStore';
                    el.style.marginLeft = '0px';
                    el.style.marginRight = '0px';
                    el.style.minWidth = '0px';
                    el.style.borderRadius = '0px';
                    el.style.pointerEvents = 'auto';
                    
                    let overlay = overlays[appletKey];
                    overlay.remove();
                }
            });
            overlays = {};
            if (frameEl) frameEl.style.transform = 'translate(0px, 100%)';
        }
    }, [showTabs]);
    return <div />;
}

export default AppletTabs
