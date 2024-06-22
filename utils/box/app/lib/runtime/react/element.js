
class Element {
  constructor(tagName, props, children) {
    if (Array.isArray(props)) {
      children = props;
      props = {};
    }
    this.tagName = tagName;
    this.props = props || {};
    this.children = children || [];
    this.key = props ? props.key : undefined;
  }
}

export default Element;
