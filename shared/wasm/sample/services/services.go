package services

import (
	"sigma/wasm/core"
	"sigma/wasm/dtos"
)

var name = ""

func Hello(input dtos.HelloInput) dtos.HelloOutput {
	name = input.Name
	return dtos.HelloOutput{Message: "welcome " + input.Name + " !"}
}

func Bye(input dtos.ByeInput) dtos.ByeOutput {
	return dtos.ByeOutput{Message: "Bye " + name + " !"}
}

func CreateGreetServices() {
	core.AddMethod("hello", Hello)
	core.AddMethod("bye", Bye)
}