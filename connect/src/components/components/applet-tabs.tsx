import { Actions, States, useTheme } from "@/api/client/states";
import { useEffect } from "react";
import { appletCache } from "./applet-host";

let overlays: { [id: string]: HTMLDivElement } = {};

const AppletTabs = () => {
    const { theme } = useTheme();
    const minimizedApplets = States.useListener(States.store.minimizedApplets);
    const showTabs = States.useListener(States.store.showAppletTabs);
    useEffect(() => {
        let frameEl = document.getElementById("frames");
        let framesListEl = document.getElementById("framesList");
        if (showTabs) {
            let stageSlot = document.getElementById('frameTabsStage');
            if (stageSlot) stageSlot.style.display = 'none';
            let items: { original: HTMLElement, shadow: HTMLElement }[] = [];
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
                        el.style.borderRadius = '24px';
                        el.style.pointerEvents = 'none';
                        el.style.transition = 'transform 250ms';
                        el.style.transform = 'translate(0px, 0px)';
                        el.style.boxShadow = 'rgba(0, 0, 0, 0.24) 0px 3px 8px';
                        el.style.minWidth = (window.innerWidth * 85 / 100) + 'px';
                        el.style.maxHeight = (window.innerHeight * 80 / 100) + 'px';
                        el.style.marginTop = (window.innerHeight * 25 / 100 / 2) + 'px'
                        let mxL = (i === 0) ?
                            ((window.innerWidth * 15 / 4 / 100)) :
                            ((-window.innerWidth * 65 / 100));
                        el.style.marginLeft = mxL - (i === 0 ? 0 : (window.innerWidth * 15 * 3 / 100 / 4)) + 'px';

                        let overlay = document.createElement('div');
                        overlay.style.minWidth = (window.innerWidth * 85 / 100) + 'px';
                        overlay.style.height = (window.innerHeight * 85 / 100) + 'px';
                        overlay.style.marginRight = (window.innerWidth * 15 / 100) + 'px';
                        overlay.style.marginLeft = (-window.innerWidth * 85 / 100) + 'px';
                        overlay.style.transition = 'transform 250ms';
                        overlay.style.transform = 'translate(0px, 0px)';
                        overlay.style.maxHeight = (window.innerHeight * 80 / 100) + 'px';
                        overlay.style.marginTop = (window.innerHeight * 25 / 100 / 2) + 'px'
                        overlay.id = 'overlay-' + appletKey;

                        overlay.onclick = () => {
                            Actions.switchAppletTabs(false);
                            setTimeout(() => {
                                Actions.restoreApplet(appletKey);
                            }, 250);
                        }
                        overlays[appletKey] = overlay;

                        el.parentNode?.insertBefore(overlay, el.nextSibling);
                        overlay.slot = 'frameTabs';
                        let touchStart = [0, 0];
                        let lastTouch = [0, 0];
                        let direction = "";
                        overlay.ontouchstart = (ev) => {
                            touchStart[0] = ev.touches[0].clientX;
                            touchStart[1] = ev.touches[0].clientY;
                        }
                        overlay.ontouchmove = (ev) => {
                            let x = ev.touches[0].clientX;
                            let y = ev.touches[0].clientY;
                            lastTouch[0] = x;
                            lastTouch[1] = y;
                            let diffX = x - touchStart[0];
                            let diffY = y - touchStart[1];
                            let valX = Math.abs(diffX);
                            let valY = Math.abs(diffY);
                            if (direction === "") {
                                if ((valY > valX) && (valY > 25)) {
                                    direction = "vertical";
                                } else if ((valY <= valX) && (valX > 25)) {
                                    direction = "horizontal";
                                }
                            }
                            if (direction === "vertical") {
                                overlay.style.transform = `translate(0px, ${diffY}px)`;
                                el.style.transform = `translate(0px, ${diffY}px)`;
                            } else if (direction === "horizontal") {
                                items.forEach((item, index) => {
                                    let finalValX = Math.max(Math.min(diffX, index * 10), -index * 50);
                                    item.original.style.transform = `translate(${finalValX}px, 0px)`;
                                    item.shadow.style.transform = `translate(${finalValX}px, 0px)`;
                                });
                            }
                        }
                        overlay.ontouchend = () => {
                            direction = "";
                            if (lastTouch[1] === 0) {
                                return;
                            }
                            let diffX = lastTouch[0] - touchStart[0];
                            let diffY = lastTouch[1] - touchStart[1];
                            if (diffY < -200) {
                                overlay.style.transform = `translate(${diffX}px, ${-window.innerHeight}px)`;
                                el.style.transform = `translate(${diffX}px, ${-window.innerHeight}px)`;
                                setTimeout(() => {
                                    let overlay = overlays[appletKey];
                                    delete overlays[appletKey];
                                    el.remove();
                                    overlay.remove();
                                    (window as any).closeTab(el.id);
                                    Actions.closeApplet(el.id);
                                    let nextIndex = -1;
                                    items = items.filter((item, i) => {
                                        if ((item.original instanceof HTMLIFrameElement) && (item.original.id === el.id)) {
                                            nextIndex = i + 1;
                                            return false;
                                        }
                                        return true;
                                    });
                                    if (nextIndex > 0) {
                                        let newTransformX = (nextIndex === 1) ?
                                            (((window.innerWidth * 15 / 4 / 100)) - (nextIndex === 1 ? 0 : (window.innerWidth * 15 * 3 / 100 / 4))) :
                                            (-window.innerWidth * 65 / 100);
                                        if (items[nextIndex - 1]) {
                                            items[nextIndex - 1].original.style.marginLeft = newTransformX + 'px';
                                        }
                                    }
                                    if (items.length > 0) {
                                        items.forEach((item, index) => {
                                            let finalValX = Math.max(Math.min(diffX, index * 10), -index * 50);
                                            item.original.style.transform = `translate(${finalValX}px, 0px)`;
                                            item.shadow.style.transform = `translate(${finalValX}px, 0px)`;
                                        });
                                    } else {
                                        Actions.switchAppletTabs(false);
                                    }
                                }, 250);
                            } else {
                                items.forEach((item, index) => {
                                    let finalValX = Math.max(Math.min(diffX, index * 10), -index * 50);
                                    item.original.style.transform = `translate(${finalValX}px, 0px)`;
                                    item.shadow.style.transform = `translate(${finalValX}px, 0px)`;
                                });
                            }
                        }
                        items.push({ original: el, shadow: overlay });
                    }
                }
            }
            Object.keys(appletCache).forEach((appletKey, index) => {
                let el = appletCache[appletKey].element;
                if (el instanceof HTMLDivElement) {
                    el.style.minWidth = (window.innerWidth * 85 / 100) + 'px';
                    el.style.borderRadius = '24px';
                    el.style.pointerEvents = 'none';

                    let container = document.createElement('div');
                    container.style.minWidth = (window.innerWidth * 85 / 100) + 'px';
                    container.style.backgroundColor = theme === "light" ? '#fff' : '#213037';
                    container.style.borderRadius = '24px';
                    let mxL = ((framesListEl?.children.length === 0) && (index === 0)) ?
                        ((window.innerWidth * 15 / 4 / 100)) :
                        ((-window.innerWidth * 65 / 100));
                    container.style.marginLeft = mxL - ((framesListEl && (framesListEl.children.length > 0) && (index === 0)) ? (window.innerWidth * 15 * 3 / 100 / 4) : 0) + 'px';
                    container.style.marginRight = (window.innerWidth * 15 / 4 / 100) + 'px';
                    container.style.transition = 'transform 250ms';
                    container.style.transform = 'translate(0px, 0px)';
                    container.style.maxHeight = (window.innerHeight * 80 / 100) + 'px';
                    container.style.marginTop = (window.innerHeight * 25 / 100 / 2) + 'px'
                    container.id = "container-" + appletKey;
                    container.onclick = () => {
                        Actions.switchAppletTabs(false);
                        setTimeout(() => {
                            Actions.restoreApplet(appletKey.substring("desktop-sheet-".length));
                        }, 250);
                    }
                    container.style.boxShadow = 'rgba(0, 0, 0, 0.24) 0px 3px 8px';
                    container.appendChild(el);

                    overlays[appletKey] = container;

                    framesListEl?.appendChild(container);
                    container.slot = "frameTabs";
                    let touchStart = [0, 0];
                    let lastTouch = [0, 0];
                    let direction = "";
                    container.ontouchstart = (ev) => {
                        touchStart[0] = ev.touches[0].clientX;
                        touchStart[1] = ev.touches[0].clientY;
                    }
                    container.ontouchmove = (ev) => {
                        let x = ev.touches[0].clientX;
                        let y = ev.touches[0].clientY;
                        lastTouch[0] = x;
                        lastTouch[1] = y;
                        let diffX = x - touchStart[0];
                        let diffY = y - touchStart[1];
                        let valX = Math.abs(diffX);
                        let valY = Math.abs(diffY);
                        if (direction === "") {
                            if ((valY > valX) && (valY > 25)) {
                                direction = "vertical";
                            } else if ((valY <= valX) && (valX > 25)) {
                                direction = "horizontal";
                            }
                        }
                        if (direction === "vertical") {
                            container.style.transform = `translate(0px, ${diffY}px)`;
                        } else if (direction === "horizontal") {
                            items.forEach((item, index) => {
                                let finalValX = Math.max(Math.min(diffX, index * 10), -index * 50);
                                item.original.style.transform = `translate(${finalValX}px, 0px)`;
                                item.shadow.style.transform = `translate(${finalValX}px, 0px)`;
                            });
                        }
                    }
                    container.ontouchend = () => {
                        direction = "";
                        let diffX = lastTouch[0] - touchStart[0];
                        let diffY = lastTouch[1] - touchStart[1];
                        if (diffY < -200) {
                            container.style.transform = `translate(${diffX}px, ${-window.innerHeight}px)`;
                            setTimeout(() => {
                                let overlay = overlays[appletKey];
                                overlay.remove();
                                delete overlays[appletKey];
                                container.slot = 'frameStore';
                                Actions.closeApplet(appletKey.substring("desktop-sheet-".length));
                                let nextIndex = -1;
                                items = items.filter((item, i) => {
                                    if ((item.shadow instanceof HTMLDivElement) && (item.shadow.id === container.id)) {
                                        nextIndex = i + 1;
                                        return false;
                                    }
                                    return true;
                                });
                                if (nextIndex > 0) {
                                    let newTransformX = (nextIndex === 1) ?
                                        (window.innerWidth * 15 / 100) :
                                        (-window.innerWidth * 65 / 100);
                                    newTransformX = newTransformX - ((framesListEl && (framesListEl.children.length > 0) && (nextIndex === 1)) ? (window.innerWidth * 15 * 3 / 100 / 4) : 0);
                                    if (items[nextIndex - 1]) {
                                        items[nextIndex - 1].original.style.marginLeft = newTransformX + 'px';
                                    }
                                }
                                if (items.length > 0) {
                                    items.forEach((item, index) => {
                                        let finalValX = Math.max(Math.min(diffX, index * 10), -index * 50);
                                        item.original.style.transform = `translate(${finalValX}px, 0px)`;
                                        item.shadow.style.transform = `translate(${finalValX}px, 0px)`;
                                    });
                                } else {
                                    Actions.switchAppletTabs(false);
                                }
                            }, 250);
                        } else {
                            items.forEach((item, index) => {
                                let finalValX = Math.max(Math.min(diffX, index * 10), -index * 50);
                                item.original.style.transform = `translate(${finalValX}px, 0px)`;
                                item.shadow.style.transform = `translate(${finalValX}px, 0px)`;
                            });
                        }
                    }
                    items.push({ original: container, shadow: container });
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
                    el.style.minWidth = '';
                    el.style.borderRadius = '0px';
                    el.style.pointerEvents = 'auto';
                    el.style.boxShadow = '';
                    el.style.maxHeight = '';
                    el.style.marginTop = '0px'
                    el.style.transition = '';
                    el.style.transform = 'translate(0px, 0px)';

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
