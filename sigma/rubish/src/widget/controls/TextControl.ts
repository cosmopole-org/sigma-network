
import BaseControl from './BaseControl';
import StringProp from '../props/StringProp'
import Utils from '../utils';
import BaseElement from '../elements/BaseElement';

class TextControl extends BaseControl {

    public static readonly TYPE = 'text'
    public static defaultProps = {
        text: new StringProp('')
    }
    public static defaultStyles = {
        
    }

    public static instantiate(overridenProps: { [id: string]: any }, overridenStyles: { [id: string]: any }, children: Array<BaseElement>) {
        return Utils.generator.prepareElement(TextControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children)
    }
}

export default TextControl
