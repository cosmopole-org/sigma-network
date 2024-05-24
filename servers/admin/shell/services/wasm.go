package services

import (
	"encoding/json"

	"sigma/admin/core/modules"

	dtos_external "sigma/admin/core/dtos/external"
	mans "sigma/admin/shell/managers"
	outputs_external "sigma/admin/shell/outputs/external"

	"github.com/gofiber/fiber/v2"
	"github.com/second-state/WasmEdge-go/wasmedge"
)

type WasmManager struct {
	PluginVms   map[string]*wasmedge.VM
	PluginMetas map[string]modules.PluginFunction
}

const pluginsTemplateName = "/plugins/"

type WasmService struct {
	managers *mans.Managers
}

func (w *WasmService) plug(app *modules.App, input dtos_external.PlugDto, assistant modules.Assistant) (any, error) {
	var meta []modules.PluginFunction
	err := json.Unmarshal([]byte(input.Meta), &meta)
	if err != nil {
		return outputs_external.PlugDto{}, err
	}

	w.managers.StorageManager().SaveFileToGlobalStorage(app.StorageRoot+pluginsTemplateName+input.Key, input.File, "module.wasm", true)
	w.managers.StorageManager().SaveDataToGlobalStorage(app.StorageRoot+pluginsTemplateName+input.Key, []byte(input.Meta), "meta.txt", true)

	w.managers.WasmManager().Plug(app.StorageRoot+pluginsTemplateName+input.Key+"/module.wasm", meta)

	return outputs_external.PlugDto{}, nil
}

func CreateWasmPluggerService(sc *modules.App, mans *mans.Managers) {

	wasmS := &WasmService{
		managers: mans,
	}

	// Methods
	sc.Services.AddAction(
		modules.CreateAction(
			sc,
			"/external/plug",
			modules.CreateCk(true, false, false),
			modules.CreateAc(true, true, false, false, fiber.MethodPost),
			true,
			wasmS.plug,
		),
	)
}
