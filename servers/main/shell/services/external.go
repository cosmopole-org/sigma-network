package services

import (
	"encoding/json"
	"log"
	"os"
	"sigma/main/core/modules"
	
	dtos_external "sigma/main/shell/dtos/external"
	outputs_external "sigma/main/shell/outputs/external"

	"github.com/gofiber/fiber/v2"
	"github.com/wasmerio/wasmer-go/wasmer"
)

var wasmEngine = wasmer.NewEngine()
var wasmStore = wasmer.NewStore(wasmEngine)

func plug(app *modules.App, input dtos_external.PlugDto, assistant modules.Assistant) (any, error) {
	var meta []modules.PluginFunction
	err := json.Unmarshal([]byte(input.Meta), &meta)
	if err != nil {
		return outputs_external.PlugDto{}, err
	}
	assistant.SaveFileToGlobalStorage(app.StorageRoot+"/plugins/"+input.Key, input.File, "module.wasm")
	assistant.SaveDataToGlobalStorage(app.StorageRoot+"/plugins/"+input.Key, []byte(input.Meta), "meta.txt")

	wasmBytes, _ := os.ReadFile(app.StorageRoot + "/plugins/" + input.Key + "/module.wasm")
	module, _ := wasmer.NewModule(wasmStore, wasmBytes)
	importObject := wasmer.NewImportObject()
	instance, _ := wasmer.NewInstance(module, importObject)
	for _, f := range meta {
		fn, err := instance.Exports.GetFunction(f.Key)
		if err != nil {
			log.Println(err)
			continue
		}
		modules.AddMethod(
			app,
			modules.CreateRawMethod[modules.IDto, modules.IDto](
				f.Key,
				func(a1 *modules.App, i string, a2 modules.Assistant) (any, error) {
					resStr, err := fn(i)
					if err != nil {
						log.Println(err)
						return nil, err
					}
					return resStr, nil
				},
				nil,
				f.Ch,
				f.Mo,
				modules.CreateInterFedOptions(true, true),
			))
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
