package actions_greet

import (
	"games/hokm/core"
	"games/hokm/inputs"
	"games/hokm/outputs"
)

var name = ""

func Hello(input inputs.HelloInput) outputs.HelloOutput {
	name = input.Name
	return outputs.HelloOutput{Message: "welcome " + input.Name + " !"}
}

func Bye(input inputs.ByeInput) outputs.ByeOutput {
	return outputs.ByeOutput{Message: "Bye " + name + " !"}
}

func CreateGreetServices() {
	core.AddMethod("hello", Hello)
	core.AddMethod("bye", Bye)
}
