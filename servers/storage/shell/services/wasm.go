package services

import (
	"encoding/json"

	"sigma/storage/core/models"
	"sigma/storage/core/runtime"

	inputs_external "sigma/storage/core/inputs/external"
	tools "sigma/storage/shell/tools"
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
	managers tools.IShellTools
}

func (w *WasmService) plug(control *runtime.Control, input inputs_external.PlugInput, info models.Info) (any, error) {
	var meta []runtime.PluginFunction
	err := json.Unmarshal([]byte(input.Meta), &meta)
	if err != nil {
		return outputs_external.PlugInput{}, err
	}

	w.managers.File().SaveFileToGlobalStorage(control.StorageRoot+pluginsTemplateName+input.Key, input.File, "module.wasm", true)
	w.managers.File().SaveDataToGlobalStorage(control.StorageRoot+pluginsTemplateName+input.Key, []byte(input.Meta), "meta.txt", true)

	w.managers.Wasm().Plug(control.StorageRoot+pluginsTemplateName+input.Key+"/module.wasm", meta)

	return outputs_external.PlugInput{}, nil
}

func CreateWasmPluggerService(sc *runtime.App, mans tools.IShellTools) {

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
			false,
			wasmS.plug,
		),
	)
}
