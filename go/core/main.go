package main

import (
	"fmt"
	"sigma/core/src/core"
	"sigma/core/src/types"

	"github.com/valyala/fasthttp"
)

var testVal = "hello"

func helloWorld(input *types.IPacket) {
	wp := (*input).(types.WebPacket)
	wp.AnswerWithJson(fasthttp.StatusOK, map[string]string{}, []byte(`{ "hello": "` + testVal + `" }`))
	testVal = "bye"
}

func byeWorld(input *types.IPacket) {
	wp := (*input).(types.LoginPacket)
	fmt.Println(wp.GetData())
}

func main() {
	app := core.CreateApp("sigma-sample")
	app.AddService(
		types.CreateService("api").
			AddMethod(
				types.CreateMethod(
					"helloWorld",
					helloWorld,
					*types.CreateCheck(false, false, false),
				),
			).
			AddMethod(
				types.CreateMethod(
					"byeWorld",
					byeWorld,
					*types.CreateCheck(false, false, false),
				),
			),
	)
	var testInput [1]any
	testInput[0] = "hello keyhan !"
	app.GetService("api").CallMethod("byeWorld", testInput[:])
	app.Listen(8000)
}
