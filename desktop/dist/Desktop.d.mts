import * as react_jsx_runtime from 'react/jsx-runtime';
import * as RGL from 'react-grid-layout';

declare class DesktopData {
    key: string;
    layouts: RGL.Layouts;
    jsxContent: {
        [id: string]: string;
    };
    layoutCnangeFromUICallback?: (layouts: RGL.Layouts, updates: Array<any>) => void;
    layoutCnangeFromCodeCallback?: (layouts: RGL.Layouts) => void;
    layoutCnangeFromCodeInternallCallback?: (layouts: RGL.Layouts) => void;
    constructor();
    fill(layouts: RGL.Layouts, jsxContent: {
        [id: string]: string;
    }): void;
    destroy(): void;
    addWidget(widget: {
        id: string;
        jsxCode: string;
        gridData: {
            w: number;
            h: number;
        };
    }): void;
    removeWidget(id: string): void;
    onLayoutChangeByUI(callback: (layouts: RGL.Layouts, updates: Array<any>) => void): void;
    onLayoutChangeByCode(callback: (layouts: RGL.Layouts) => void): void;
    onLayoutChangeByCodeInternally(callback: (layouts: RGL.Layouts) => void): void;
    updateLayoutsInternally(layouts: RGL.Layouts, updates: Array<any>): void;
}
declare const _default: {
    Host: (props: {
        desktopKey: string;
        editMode: boolean;
        style: any;
    }) => react_jsx_runtime.JSX.Element;
    DesktopData: typeof DesktopData;
};

export { _default as default };
