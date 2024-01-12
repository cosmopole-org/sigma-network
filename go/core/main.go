package main

import (
	"sigma/core/src/core"
	"sigma/core/src/interfaces"
	"sigma/core/src/types"

	"github.com/valyala/fasthttp"
)

func hello(app *interfaces.IApp, input interfaces.IPacket) {
	wp := input.(types.WebPacket)
	wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, []byte(`{ "hello": "world" }`))
}

func main() {
	app := core.CreateApp("sigma-sample")
	app.AddService(
		types.CreateService("api").
			AddMethod(
				types.CreateMethod(
					"hello",
					hello,
					*types.CreateCheck(false, false, false),
				),
			),
	)
	app.Listen(8000)
}
