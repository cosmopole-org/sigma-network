package services

import (
	"encoding/json"

	"sigma/main/core/models"
	"sigma/main/core/runtime"

	inputs_external "sigma/main/core/inputs/external"
	mans "sigma/main/shell/managers"
	outputs_external "sigma/main/shell/outputs/external"

	"github.com/gofiber/fiber/v2"
	"github.com/second-state/WasmEdge-go/wasmedge"
)

type WasmManager struct {
	PluginVms   map[string]*wasmedge.VM
	PluginMetas map[string]runtime.PluginFunction
}

const pluginsTemplateName = "/plugins/"

type WasmService struct {
	managers mans.IShellManagers
}

func (w *WasmService) plug(control *runtime.Control, input inputs_external.PlugInput, info models.Info) (any, error) {
	var meta []runtime.PluginFunction
	err := json.Unmarshal([]byte(input.Meta), &meta)
	if err != nil {
		return outputs_external.PlugInput{}, err
	}

	w.managers.FileManager().SaveFileToGlobalStorage(control.StorageRoot+pluginsTemplateName+input.Key, input.File, "module.wasm", true)
	w.managers.FileManager().SaveDataToGlobalStorage(control.StorageRoot+pluginsTemplateName+input.Key, []byte(input.Meta), "meta.txt", true)

	w.managers.WasmManager().Plug(control.StorageRoot+pluginsTemplateName+input.Key+"/module.wasm", meta)

	return outputs_external.PlugInput{}, nil
}

func CreateWasmPluggerService(sc *runtime.App, mans mans.IShellManagers) {

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
