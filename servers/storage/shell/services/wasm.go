package services

import (
	"encoding/json"

	"sigma/storage/core/models"
	"sigma/storage/core/runtime"

	dtos_external "sigma/storage/core/dtos/external"
	mans "sigma/storage/shell/managers"
	outputs_external "sigma/storage/shell/outputs/external"

	"github.com/gofiber/fiber/v2"
	"github.com/second-state/WasmEdge-go/wasmedge"
)

type WasmManager struct {
	PluginVms   map[string]*wasmedge.VM
	PluginMetas map[string]runtime.PluginFunction
}

const pluginsTemplateName = "/plugins/"

type WasmService struct {
	managers *mans.Managers
}

func (w *WasmService) plug(app *runtime.App, input dtos_external.PlugDto, assistant models.Assistant) (any, error) {
	var meta []runtime.PluginFunction
	err := json.Unmarshal([]byte(input.Meta), &meta)
	if err != nil {
		return outputs_external.PlugDto{}, err
	}

	w.managers.StorageManager().SaveFileToGlobalStorage(app.StorageRoot+pluginsTemplateName+input.Key, input.File, "module.wasm", true)
	w.managers.StorageManager().SaveDataToGlobalStorage(app.StorageRoot+pluginsTemplateName+input.Key, []byte(input.Meta), "meta.txt", true)

	w.managers.WasmManager().Plug(app.StorageRoot+pluginsTemplateName+input.Key+"/module.wasm", meta)

	return outputs_external.PlugDto{}, nil
}

func CreateWasmPluggerService(sc *runtime.App, mans *mans.Managers) {

	wasmS := &WasmService{
		managers: mans,
	}

	// Methods
	sc.Services.AddAction(
		runtime.CreateAction(
			sc,
			"/external/plug",
			runtime.CreateCk(true, false, false),
			runtime.CreateAc(true, true, false, false, fiber.MethodPost),
			true,
			wasmS.plug,
		),
	)
}
