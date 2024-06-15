
import BaseControl from './BaseControl';
import StringProp from '../props/StringProp'
import Utils from '../utils';
import BaseElement from '../elements/BaseElement';
import FuncProp from '../props/FuncProp';

class ButtonControl extends BaseControl {

    public static readonly TYPE = 'button'
    public static defaultProps = {
        caption: new StringProp(''),
        variant: new StringProp('filled'),
        onClick: new FuncProp(undefined)
    }
    public static defaultStyles = {
        
    }

    static instantiate(overridenProps: { [id: string]: any }, overridenStyles: { [id: string]: any }, children: Array<BaseElement>) {
        return Utils.generator.prepareElement(ButtonControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children)
    }
}

export default ButtonControl
