package main

import (
	"fmt"
	"sigma/wasm/services"
)

func main() {
	fmt.Println()
	fmt.Println("module starting...")
	fmt.Println()
	services.CreateGreetServices()
}
