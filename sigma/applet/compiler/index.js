const {Parser} = require("acorn")

const MyParser = Parser.extend(
  require("acorn-jsx")()
)
console.log(MyParser.parse(`
console.log("hello world !");
`))
