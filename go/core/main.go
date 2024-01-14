package main

import (
	"sigma/core/src/core"
	"sigma/core/src/dtos"
	"sigma/core/src/interfaces"
	"sigma/core/src/types"

	"github.com/valyala/fasthttp"
)

func hello(app *interfaces.IApp, p interfaces.IPacket) {
	wp := p.(types.WebPacket)
	wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, []byte(`{ "hello": "world" }`))
}

type Cat struct { 
    Age int
}

func main() {
	app := core.CreateApp("sigma-sample")
	app.AddService(
		types.CreateService("api").
			AddMethod(
				types.CreateMethod(
					"hello",
					func (app *interfaces.IApp, p interfaces.IPacket, d interfaces.IDto)  {
						hello(app, p)	
					},
					types.CreateCheck(false, false, false),
					&dtos.HelloDto{},
				),
			),
	)
	app.Listen(8000)
}
