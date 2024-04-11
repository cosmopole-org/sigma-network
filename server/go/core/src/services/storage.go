package services

import (
	"errors"
	"fmt"
	"os"
	dtos_storage "sigma/core/src/dtos/storage"
	"sigma/core/src/interfaces"
	"sigma/core/src/outputs"
	outputs_storage "sigma/core/src/outputs/storage"
	"sigma/core/src/types"
)

func UploadFile(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	var input = (dto).(*dtos_storage.UploadDto)
	if !((len(input.Data) == 1) && (len(input.DataKey) == 1)) {
		return outputs_storage.Binary{}, errors.New("we need 1 file and 1 file key")
	}
	if err := assistant.SaveFileToStorage(app.GetStorageRoot(), input.Data[0], input.DataKey[0]); err != nil {
		fmt.Println(err)
		return outputs_storage.Binary{}, err
	}

	return outputs_storage.Binary{}, nil
}

func DownloadFile(app interfaces.IApp, dto interface{}, assistant interfaces.IAssistant) (any, error) {
	input := (dto).(*dtos_storage.DownloadDto)
	var path = fmt.Sprintf("%s/%d/%s", app.GetStorageRoot(), assistant.GetRoomId(), input.FileKey)
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return outputs_storage.Binary{}, err
	} else {
		return outputs.Command{Value: "sendFile", Data: path}, nil
	}
}

func CreateStorageService(app interfaces.IApp) interfaces.IService {
	var s = types.CreateService(app, "storage")
	s.AddMethod(types.CreateMethod("upload", UploadFile, types.CreateCheck(true, true, true), dtos_storage.UploadDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("download", DownloadFile, types.CreateCheck(true, true, true), dtos_storage.DownloadDto{}, types.CreateMethodOptions(true, false)))
	return s
}
