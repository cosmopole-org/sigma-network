package actions_user

import (
	"errors"
	"log"
	"sigma/sigma/abstract"
	modulestate "sigma/sigma/layer1/module/state"
	module_model "sigma/sigma/layer2/model"
	"sigma/sigma/utils/crypto"
	inputs_storage "sigma/sigverse/inputs/storage"
	"sigma/sigverse/model"
	models "sigma/sigverse/model"
)

type Actions struct {
	Layer abstract.ILayer
}

func Install(s abstract.IState, a *Actions) error {
	state := abstract.UseState[modulestate.IStateL1](s)
	err := state.Trx().AutoMigrate(&models.User{})
	if err != nil {
		return err
	}
	err2 := state.Trx().AutoMigrate(&models.Session{})
	if err2 != nil {
		return err2
	}
	state.Trx().Use()
	state.Trx().Push()
	return nil
}

// Upload /storage/upload check [ true true true ] access [ true false false false POST ]
func (a *Actions) Upload(s abstract.IState, input inputs_storage.UploadInput) (any, error) {
	toolbox := abstract.UseToolbox[*module_model.ToolboxL2](a.Layer.Core().Get(2).Tools())
	state := abstract.UseState[modulestate.IStateL1](s)
	trx := state.Trx()
	trx.Use()
	if input.FileId != "" {
		var file = model.File{Id: input.FileId}
		trx.First(&file)
		if file.SenderId != state.Info().UserId() {
			return nil, errors.New("access to file control denied")
		}
		if err := toolbox.File().SaveFileToStorage(toolbox.Storage().StorageRoot(), input.Data[0], state.Info().TopicId(), input.FileId); err != nil {
			log.Println(err)
			return nil, err
		}
		return map[string]any{}, nil
	} else {
		var file = model.File{Id: crypto.SecureUniqueId(a.Layer.Core().Id()), SenderId: state.Info().UserId(), TopicId: state.Info().TopicId()}
		if err := toolbox.File().SaveFileToStorage(toolbox.Storage().StorageRoot(), input.Data[0], state.Info().TopicId(), input.FileId); err != nil {
			log.Println(err)
			return nil, err
		}
		return map[string]any{"file": file}, nil
	}
}
