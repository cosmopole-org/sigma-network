package actions_plugin

import (
	"encoding/json"
	"sigma/sigma/abstract"
	modulemodel "sigma/sigma/layer2/model"
	"sigma/sigma/layer2/tools/wasm"
	inputsexternal "sigma/pluginer/inputs/plugin"
	outputsexternal "sigma/pluginer/outputs/plugin"
)

const pluginsTemplateName = "/plugins/"

type Actions struct {
	Layer abstract.ILayer
}

func Install(s abstract.IState, a *Actions) error {
	return nil
}

// Plug /plugins/plug check [ true false false ] access [ true false false false POST ]
func (a *Actions) Plug(_ abstract.IState, input inputsexternal.PlugInput) (any, error) {
	toolbox := abstract.UseToolbox[*modulemodel.ToolboxL2](a.Layer.Tools())
	var meta []wasm.PluginMeta
	err := json.Unmarshal([]byte(input.Meta), &meta)
	if err != nil {
		return nil, err
	}

	err2 := toolbox.File().SaveFileToGlobalStorage(toolbox.Storage().StorageRoot()+pluginsTemplateName+input.Key, input.File, "module.wasm", true)
	if err2 != nil {
		return nil, err2
	}
	err3 := toolbox.File().SaveDataToGlobalStorage(toolbox.Storage().StorageRoot()+pluginsTemplateName+input.Key, []byte(input.Meta), "meta.txt", true)
	if err3 != nil {
		return nil, err3
	}

	toolbox.Wasm().Plug(toolbox.Storage().StorageRoot()+pluginsTemplateName+input.Key+"/module.wasm", input.Key, meta)

	return outputsexternal.PlugInput{}, nil
}
