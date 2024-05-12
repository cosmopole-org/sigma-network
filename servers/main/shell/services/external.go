package services

import (
	"encoding/json"
	"sigma/main/core/modules"

	dtos_external "sigma/main/shell/dtos/external"
	outputs_external "sigma/main/shell/outputs/external"

	"github.com/gofiber/fiber/v2"
)

func plug(app *modules.App, input dtos_external.PlugDto, assistant modules.Assistant) (any, error) {
	apiList, err := json.Marshal(input.ApiList)
	if err != nil {
		return outputs_external.PlugDto{}, err
	}
	assistant.SaveFileToGlobalStorage(app.StorageRoot+"/plugins/"+input.Key, input.File, "module.wasm")
	assistant.SaveDataToGlobalStorage(app.StorageRoot+"/plugins/"+input.Key, apiList, "apiList.txt")
	return outputs_external.PlugDto{}, nil
}

func CreateExternalService(app *modules.App) {
	// Methods
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_external.PlugDto, dtos_external.PlugDto](
			"/external/plug",
			plug,
			dtos_external.PlugDto{},
			modules.CreateCheck(true, false, false),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, false),
			modules.CreateInterFedOptions(true, true),
		),
	)
}
