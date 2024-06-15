
import BaseControl from './BaseControl';
import Utils from '../utils';
import BaseElement from '../elements/BaseElement';

class PrimaryTabControl extends BaseControl {

    public static readonly TYPE = 'primary-tab'
    public static defaultProps = {
        
    }
    public static defaultStyles = {
        
    }

    public static instantiate(overridenProps: { [id: string]: any }, overridenStyles: { [id: string]: any }, children: Array<BaseElement>) {
        return Utils.generator.prepareElement(PrimaryTabControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children)
    }
}

export default PrimaryTabControl
