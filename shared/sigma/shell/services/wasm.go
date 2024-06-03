package services

import (
	"encoding/json"

	"sigma/main/core/models"
	"sigma/main/core/runtime"

	inputs_external "sigma/main/core/inputs/external"
	outputs_external "sigma/main/shell/outputs/external"
	tools "sigma/main/shell/tools"

	"github.com/gofiber/fiber/v2"
	"github.com/second-state/WasmEdge-go/wasmedge"
)

type WasmManager struct {
	PluginVms   map[string]*wasmedge.VM
	PluginMetas map[string]runtime.PluginFunction
}

const pluginsTemplateName = "/plugins/"

type WasmService struct {
	toolbox *tools.Toolbox
}

func (w *WasmService) plug(control *runtime.Control, input inputs_external.PlugInput, info models.Info) (any, error) {
	var meta []runtime.PluginFunction
	err := json.Unmarshal([]byte(input.Meta), &meta)
	if err != nil {
		return outputs_external.PlugInput{}, err
	}

	w.toolbox.File().SaveFileToGlobalStorage(control.Adapters().Storage().StorageRoot()+pluginsTemplateName+input.Key, input.File, "module.wasm", true)
	w.toolbox.File().SaveDataToGlobalStorage(control.Adapters().Storage().StorageRoot()+pluginsTemplateName+input.Key, []byte(input.Meta), "meta.txt", true)

	w.toolbox.Wasm().Plug(control.Adapters().Storage().StorageRoot()+pluginsTemplateName+input.Key+"/module.wasm", meta)

	return outputs_external.PlugInput{}, nil
}

func CreateWasmPluggerService(toolbox *tools.Toolbox) {

	wasmS := &WasmService{
		toolbox: toolbox,
	}

	// Methods
	toolbox.Services().AddAction(
		runtime.CreateAction(
			toolbox.App,
			"/external/plug",
			runtime.CreateCk(true, false, false),
			runtime.CreateAc(true, true, false, false, fiber.MethodPost),
			false,
			wasmS.plug,
		),
	)
}
