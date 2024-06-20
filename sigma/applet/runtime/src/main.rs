
#![feature(box_into_inner)]

mod utils;
mod models;
mod types;

use models::core::Core;
use std::fs;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    let core: &mut Core = &mut Core::new();
    let ast_str: String = fs::read_to_string("/home/keyhan/MyWorkspace/sigma/sigma/applet/compiler/result.json")?;
    core.runner.parse_ast_json(ast_str);
    core.runner.run();
    Ok(())
}
