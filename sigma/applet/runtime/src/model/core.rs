
use super::generator::Generator;

pub struct Core {
    pub generator: Generator
}

impl Core {
    pub fn new() -> Core {
        return Core{
            generator: Generator::new()
        };
    }
}
