
use std::{ any::Any, collections::HashMap };
use crate::{types::builtins::{Number, Value}, utils::{ any_map::AnyMap, exec_res::ExecRes }};

pub struct Engine {
    memory: HashMap<String, dyn Value>,
    empty_unit: Unit,
}

impl Engine {
    pub fn new() -> Engine {
        return Engine {
            memory: HashMap::new(),
            empty_unit: Unit { _type: "empty".to_string(), value: AnyMap::new() },
        };
    }
    pub fn execute<'a>(& 'a self, op: &serde_json::Value) -> ExecRes<String> {
        let mut result = ExecRes::new(0);
        match get_str(&op, "type".to_string()) {
            "Program" => {
                for child_op in get_arr(&op, "body".to_string()) {
                    let res = self.execute(child_op);
                    if res.res_code() > 0 {
                        result.set_res_code(res.res_code());
                        result.set_error(res.error());
                        break;
                    }
                }
            }
            "ExpressionStatement" => {
                return self.execute(op.get("expression").unwrap());
            }
            "CallExpression" => {
                let callee = self.execute(op.get("callee").unwrap());
                let args = self.execute(op.get("arguments").unwrap());
            }
            "Identifier" => 'Identifier: {
                let val = Number::new(10);
                self.memory.insert("age".to_string(), val);
                // let id = get_str(op, "name".to_string());
                // if !self.memory.contains_key(id) {
                //     result.set_res_code(2);
                //     result.set_error("memory unit not found".to_string());
                //     break 'Identifier;
                // }
                // result.insert("value".to_string(), self.memory.get(id).unwrap());
            }
            _ => {
                result = ExecRes::new(1);
            }
        }
        return result;
    }
}

fn get_str(op: &serde_json::Value, field_name: String) -> &str {
    return op
        .get(field_name)
        .and_then(|value| value.as_str())
        .unwrap();
}

fn get_arr(op: &serde_json::Value, field_name: String) -> &Vec<serde_json::Value> {
    return op
        .get(field_name)
        .and_then(|value| value.as_array())
        .unwrap();
}

struct Result {
    pub _type: String,
    value: Box<dyn Any>,
}

impl Result {
    pub fn get_value<V: 'static>(&self) -> Option<&V> {
        return self.value.downcast_ref::<V>();
    }
}

struct Unit {
    pub _type: String,
    value: AnyMap<String>,
}
