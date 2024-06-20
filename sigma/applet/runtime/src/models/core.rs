
use super::generator::Generator;
use super::runner::Runner;

pub struct Core {
    pub generator: Generator,
    pub runner: Runner
}

impl Core {
    pub fn new() -> Core {
        return Core{
            generator: Generator::new(),
            runner: Runner::new(),
        };
    }
}
