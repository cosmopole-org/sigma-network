import BaseProp from "../props/BaseProp";

class BaseElement {

    public _key: string
    public get key() { return this._key }

    private _controlType: string
    public get controlType() { return this._controlType }

    public _props: { [key: string]: BaseProp }
    get props() { return this._props }

    public _styles: { [key: string]: any }
    get styles() { return this._styles }

    public _children: Array<BaseElement>
    get children() { return this._children }

    public update(props?: { [id: string]: any }, styles?: { [id: string]: any }, children?: Array<BaseElement>) {
        if (props) this._props = props
        if (styles) this._styles = styles
        if (children) this._children = children
    }

    constructor(
        key: string,
        controlType: string,
        props: { [key: string]: BaseProp },
        styles: { [key: string]: any },
        children?: Array<BaseElement>
    ) {
        this._key = key
        this._controlType = controlType
        this._props = props;
        this._styles = styles
        this._children = children ? children : []
    }
}

export default BaseElement
