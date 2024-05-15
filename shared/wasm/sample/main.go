package main

import (
	"sigma/wasm/core"
	"sigma/wasm/services"
)

func main() {}

//export build
func build() {
	services.CreateGreetServices()
}

//export run
func run(keyPtr *int32, bodyPtr *int32) *int32 {
	return core.Run(keyPtr, bodyPtr)
}
