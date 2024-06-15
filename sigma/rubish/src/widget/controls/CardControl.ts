
import BaseControl from './BaseControl';
import Utils from '../utils';
import BaseElement from '../elements/BaseElement';

class CardControl extends BaseControl {

    public static readonly TYPE = 'card'
    public static defaultProps = {
        
    }
    public static defaultStyles = {
        boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
        backgroundColor: '#fff',
        borderRadius: 4
    }

    public static instantiate(overridenProps: { [id: string]: any }, overridenStyles: { [id: string]: any }, children: Array<BaseElement>) {
        return Utils.generator.prepareElement(CardControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children)
    }
}

export default CardControl
