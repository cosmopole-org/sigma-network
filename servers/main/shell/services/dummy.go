package services

import (
	"os"
	"sigma/main/shell/dtos"
	"sigma/main/core/modules"

	"github.com/gofiber/fiber/v2"
)

func CreateDummyService(app *modules.App) {
	modules.AddMethod[dtos.HelloDto, dtos.HelloDto](
		app,
		modules.CreateMethod[dtos.HelloDto, dtos.HelloDto](
			"/api/hello",
			func (app *modules.App, d dtos.HelloDto, assistant modules.Assistant) (any, error) {
				return `{ "hello": "world" }`, nil
			},
			dtos.HelloDto{},
			modules.CreateCheck(false, false, false),
			modules.CreateMethodOptions(true, fiber.MethodGet, true, false),
			modules.CreateInterFedOptions(true, true),
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
			modules.CreateInterFedOptions(true, true),
		),
	)
}
