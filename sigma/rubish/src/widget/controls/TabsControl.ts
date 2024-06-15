
import BaseControl from './BaseControl';
import Utils from '../utils';
import BaseElement from '../elements/BaseElement';
import FuncProp from '../props/FuncProp';

class TabsControl extends BaseControl {

    public static readonly TYPE = 'tabs'
    public static defaultProps = {
        onChange: new FuncProp(undefined)
    }
    public static defaultStyles = {
        
    }

    public static instantiate(overridenProps: { [id: string]: any }, overridenStyles: { [id: string]: any }, children: Array<BaseElement>) {
        return Utils.generator.prepareElement(TabsControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children)
    }
}

export default TabsControl
