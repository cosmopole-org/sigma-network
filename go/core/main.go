package main

import (
	"fmt"
	"sigma/core/src/core"
	"sigma/core/src/network"

	"github.com/valyala/fasthttp"
)

func helloWorld(ctx *fasthttp.RequestCtx) {
	fmt.Fprintf(ctx, "Hi there! RequestURI is %q", ctx.RequestURI())
}

func main() {
	app := core.CreateApp("sigma-sample")
	var service = network.CreateService("api")
	app.AddService(service)
	var method = network.CreateMethod("helloWorld", helloWorld)
	service.AddMethod(method)
	app.Listen(8000)
}
