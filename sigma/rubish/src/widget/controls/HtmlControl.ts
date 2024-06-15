
import BaseControl from './BaseControl';
import Utils from '../utils';
import BaseElement from '../elements/BaseElement';

class HtmlControl extends BaseControl {

    public static readonly TYPE = 'html'
    public static defaultProps = {
        
    }
    public static defaultStyles = {
        
    }

    public static instantiate(overridenProps: { [id: string]: any }, overridenStyles: { [id: string]: any }, children: Array<BaseElement>) {
        return Utils.generator.prepareElement(HtmlControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children)
    }
}

export default HtmlControl
