package actions_plugin

import (
	"encoding/json"

	"sigma/main/core/models"
	"sigma/main/core/runtime"

	inputs_external "sigma/main/core/inputs/external"
	outputs_external "sigma/main/shell/outputs/external"
	tools "sigma/main/shell/tools"
)

const pluginsTemplateName = "/plugins/"

type PluginActions struct {
	toolbox *tools.Toolbox
}

// Plug /external/plug check [ true false false ] access [ true false false false POST ]
func (w *PluginActions) Plug(state sigmastate.ISigmaStatePool, input inputs_external.PlugInput, info models.Info) (any, error) {
	var meta []runtime.PluginFunction
	err := json.Unmarshal([]byte(input.Meta), &meta)
	if err != nil {
		return outputs_external.PlugInput{}, err
	}

	w.toolbox.File().SaveFileToGlobalStorage(context.Adapters().Storage().StorageRoot()+pluginsTemplateName+input.Key, input.File, "module.wasm", true)
	w.toolbox.File().SaveDataToGlobalStorage(context.Adapters().Storage().StorageRoot()+pluginsTemplateName+input.Key, []byte(input.Meta), "meta.txt", true)

	w.toolbox.Plugins().Plug(context.Adapters().Storage().StorageRoot()+pluginsTemplateName+input.Key+"/module.wasm", meta)

	return outputs_external.PlugInput{}, nil
}

func New(toolbox *tools.Toolbox) *PluginActions {
	return &PluginActions{toolbox: toolbox}
}