package main

import (
	"fmt"
	"games/hokm/actions/game"
	"games/hokm/actions/greet"
)

func main() {
	fmt.Println()
	fmt.Println("module starting...")
	fmt.Println()
	game.CreateService()
	actions_greet.CreateGreetServices()
}
