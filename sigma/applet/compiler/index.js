const fs = require('fs')
const { Parser } = require("acorn")
const jsxPlugin = require("acorn-jsx")

const MyParser = Parser.extend(
  jsxPlugin()
)

const ast = MyParser.parse(fs.readFileSync("./sample.js").toString());

fs.writeFileSync("result.json", JSON.stringify(ast, null, 2));
