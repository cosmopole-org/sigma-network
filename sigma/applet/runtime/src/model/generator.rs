
use rand::{rngs::ThreadRng, Rng};

pub struct Generator {
    random: ThreadRng
}

impl Generator {
    pub fn new() -> Generator {
        return Generator{
            random: rand::thread_rng()
        };
    }
    pub fn generate_key(&mut self) -> i32 {
        return self.random.gen::<i32>();
    }
}
