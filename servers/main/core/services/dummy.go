package services

import (
	"os"
	"sigma/main/core/dtos"
	"sigma/main/core/modules"
	shell_controller "sigma/main/shell/network/core"

	"github.com/gofiber/fiber/v2"
)

func CreateDummyService(app *modules.App, coreAccess bool) {

	shell_controller.AddEndpoint(
		modules.AddMethod[dtos.HelloDto, dtos.HelloDto](
			"/api/hello",
			func(app *modules.App, d dtos.HelloDto, assistant modules.Assistant) (any, error) {
				return `{ "hello": "world" }`, nil
			},
			modules.CreateCk(false, false, false),
			modules.CreateAc(coreAccess, fiber.MethodGet, true, false, false),
		),
	)
	shell_controller.AddEndpoint(
		modules.AddMethod[dtos.PingDto, dtos.PingDto](
			"/api/ping",
			func(app *modules.App, d dtos.PingDto, assistant modules.Assistant) (any, error) {
				return os.Getenv("MAIN_PORT"), nil
			},
			modules.CreateCk(false, false, false),
			modules.CreateAc(coreAccess, fiber.MethodGet, true, false, false),
		),
	)
}
