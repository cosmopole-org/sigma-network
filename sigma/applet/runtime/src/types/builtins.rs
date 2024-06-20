use std::any::Any;

pub trait Value {
    fn get_type(&self) -> String;
    fn get_value<T: ?Sized>(&self) -> impl Any;
}

pub struct Number {
    value: i32
}

impl Number {
    pub fn new(val: i32) -> Number {
        return Number{value: val};
    }
}

impl Value for Number {
    fn get_type(&self) -> String {
        return "i32".to_string();
    }
    fn get_value<T: ?Sized>(&self) -> impl Any {
        return self.value;
    }
}

pub struct Bool {
    value: bool
}

impl Bool {
    pub fn new(val: bool) -> Bool {
        return Bool{value: val};
    }
}

impl Value for Bool {
    fn get_type(&self) -> String {
        return "bool".to_string();
    }
    fn get_value<T: ?Sized>(&self) -> impl Any {
        return self.value;
    }
}

pub struct Str {
    value: String
}

impl Str {
    pub fn new(val: String) -> Str {
        return Str{value: val};
    }
}

impl Value for Str {
    fn get_type(&self) -> String {
        return "str".to_string();
    }
    fn get_value<T: ?Sized>(&self) -> impl Any {
        return self.value.to_string();
    }
}

