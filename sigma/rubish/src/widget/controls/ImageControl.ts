
import BaseControl from './BaseControl';
import StringProp from '../props/StringProp'
import Utils from '../utils';
import BaseElement from '../elements/BaseElement';

class ImageControl extends BaseControl {

    public static readonly TYPE = 'image'
    public static defaultProps = {
        src: new StringProp('')
    }
    public static defaultStyles = {}

    public static instantiate(overridenProps: { [id: string]: any }, overridenStyles: { [id: string]: any }, children: Array<BaseElement>) {
        return Utils.generator.prepareElement(ImageControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children)
    }
}

export default ImageControl
