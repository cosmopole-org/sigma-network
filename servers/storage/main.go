package main

import (
	"os"
	"sigma/main/shell/dtos"
	app "sigma/main/shell"

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

	port, err := strconv.ParseInt(os.Getenv("PORT"), 10, 32)
	if (err != nil) {
		panic("invalid port number")
	}

	app := app.New(
		os.Getenv("PORT"),
		os.Getenv("POSTGRES_URI"),
		os.Getenv("POSTGRES_DB")+"_"+os.Getenv("PORT"),
		os.Getenv("REDIS_URI"),
		os.Getenv("STORAGE_ROOT_PATH"),
		int(port),
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

	<-quit
}
