package main

import (
	"sigma/core/src/core"
	"sigma/core/src/dtos"
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
	"sigma/core/src/utils"

	"github.com/valyala/fasthttp"
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
			),
		)
	app.AddService(apiService)
	var apiController = types.CreateController("api", apiService)
	apiController.AddEndpoint(types.CreateEndpoint("hello", "api", "hello",
		func(app *interfaces.IApp, packet interfaces.IPacket, input interfaces.IDto, guard interfaces.IGuard) {
			wp := packet.(types.WebPacket)
			result, err := hello(app, input, guard)
			if err != nil {
				wp.AnswerWithJson(fasthttp.StatusInternalServerError, map[string]string{}, utils.BuildErrorJson(err.Error()))
			} else {
				wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, result)
			}
		}))
	app.AddController(apiController)

	app.Listen(8000, 8001)
	
	<-quit
}
