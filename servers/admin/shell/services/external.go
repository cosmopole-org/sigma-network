package services

import (
	"encoding/json"
	"fmt"
	"log"
	"sigma/admin/core/modules"

	dtos_external "sigma/admin/shell/dtos/external"
	outputs_external "sigma/admin/shell/outputs/external"

	"github.com/gofiber/fiber/v2"
)

func plug(app *modules.App, input dtos_external.PlugDto, assistant modules.Assistant) (any, error) {

	meta, err := json.Marshal(input.Meta)
	if err != nil {
		return outputs_external.PlugDto{}, err
	}
	assistant.SaveFileToGlobalStorage(app.StorageRoot+"/plugins/"+input.Key, input.File, "module.wasm")
	assistant.SaveDataToGlobalStorage(app.StorageRoot+"/plugins/"+input.Key, meta, "meta.txt")

	agent := fiber.Post("http://localhost:8081/external/plug")
	args := fiber.AcquireArgs()
	args.Set("key", input.Key)
	args.Set("meta", string(meta))
	agent.SendFile(app.StorageRoot+"/plugins/module.wasm").MultipartForm(args)
	fiber.ReleaseArgs(args)
	sc, _, errs := agent.Bytes()
	if errs != nil {
		fmt.Println(errs)
	} else {
		log.Println("wasm module sent to main with status: ", sc)
	}
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
