package main

import (
	"sigma/core/src/core"
	"sigma/core/src/dtos"
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
)

func hello(app *interfaces.IApp, d interfaces.IDto, guard interfaces.IGuard) (any, error) {
	return `{ "hello": "world" }`, nil
}

type Cat struct {
	Age int
}

var quit = make(chan struct{})

func main() {
	app := core.CreateApp("sigma-sample", "postgresql://root:OadaAkhwtDfWLD7t9WGUYqbL@sinai.liara.cloud:33721/postgres")

	var apiService = types.CreateService("api").
		AddMethod(
			types.CreateMethod(
				"hello",
				hello,
				types.CreateCheck(false, false, false),
				&dtos.HelloDto{},
				true,
			),
		)
	app.AddService(apiService)

	app.Listen(8000, 8001)

	<-quit
}
