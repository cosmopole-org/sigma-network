package services

import (
	"os"
	"sigma/main/core/modules"
	"sigma/main/shell/dtos"
	service_manager "sigma/main/shell/services/manager"

	"github.com/gofiber/fiber/v2"
)

func CreateDummyService(app *modules.App) {
	service_manager.AddEndpoint(
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
	service_manager.AddEndpoint(
		modules.CreateMethod[dtos.PingDto, dtos.PingDto](
			"/api/ping",
			func(app *modules.App, d dtos.PingDto, assistant modules.Assistant) (any, error) {
				return os.Getenv("MAIN_PORT"), nil
			},
			dtos.PingDto{},
			modules.CreateCheck(false, false, false),
			modules.CreateMethodOptions(true, fiber.MethodGet, true, false),
			modules.CreateInterFedOptions(true, true),
		),
	)
}
