
#![feature(box_into_inner)]

mod utils;
mod model;

use model::core::Core;

fn main() {
    let core: &mut Core = &mut Core::new();
    println!("{}", core.generator.generate_key());
}
