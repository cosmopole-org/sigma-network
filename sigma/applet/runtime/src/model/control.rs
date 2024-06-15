use crate::utils::any_map::AnyMap;

#[derive(Debug)]
pub struct Control {
    pub _type: String,
    pub props: AnyMap<String>,
    pub styles: AnyMap<String>,
}

impl Control {
    pub fn new(_type: String, props: AnyMap<String>, styles: AnyMap<String>) -> Control {
        return Control {
            _type,
            props,
            styles,
        };
    }
}
