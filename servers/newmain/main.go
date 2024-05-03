package main

import (
	"os"
	app "sigma/main/core/core"
	"sigma/main/core/dtos"

	"sigma/main/core/modules"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func hello(app *modules.App, d dtos.HelloDto, assistant modules.Assistant) (any, error) {
	return `{ "hello": "world" }`, nil
}

var quit = make(chan struct{})

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	app := app.New(
		os.Getenv("PORT"),
		os.Getenv("POSTGRES_URI"),
		os.Getenv("POSTGRES_DB")+"_"+os.Getenv("PORT"),
		os.Getenv("REDIS_URI"),
		os.Getenv("STORAGE_ROOT_PATH"),
		os.Getenv("MAP_SERVER"),
	)

	modules.AddMethod[dtos.HelloDto, dtos.HelloDto](
		app,
		modules.CreateMethod[dtos.HelloDto, dtos.HelloDto](
			"/api/hello",
			hello,
			dtos.HelloDto{},
			modules.CreateCheck(false, false, false),
			modules.CreateMethodOptions(true, fiber.MethodGet, true, false),
		),
	)

	modules.AddMethod[dtos.PingDto, dtos.PingDto](
		app,
		modules.CreateMethod[dtos.PingDto, dtos.PingDto](
			"/api/ping",
			func(app *modules.App, d dtos.PingDto, assistant modules.Assistant) (any, error) {
				return os.Getenv("PORT"), nil
			},
			dtos.PingDto{},
			modules.CreateCheck(false, false, false),
			modules.CreateMethodOptions(true, fiber.MethodGet, true, false),
		),
	)

	var portStr = os.Getenv("PORT")
	port, err := strconv.ParseInt(portStr, 10, 32)
	if err != nil {
		panic(err)
	}

	app.Network.Listen(modules.CreateListenOptions(true, int(port), true, int(port+2)))

	<-quit
}
