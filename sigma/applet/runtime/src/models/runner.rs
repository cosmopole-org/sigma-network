
use super::engine::Engine;

pub struct Runner {
    pub ast: serde_json::Value,
    pub engine: Engine
}

impl Runner {
    pub fn new() -> Runner {
        return Runner{
            ast: Default::default(),
            engine: Engine::new(),
        };
    }
    pub fn parse_ast_json(& mut self, json_str: String) {
        self.ast = serde_json::from_str(&json_str).unwrap();
    }
    pub fn run(& mut self) {
        self.engine.execute(&self.ast);
    }
}
