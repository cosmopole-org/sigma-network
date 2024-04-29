package services

import (
	"errors"
	"fmt"
	"os"
	dtos_storage "sigma/main/core/dtos/storage"
	"sigma/main/core/outputs"
	outputs_storage "sigma/main/core/outputs/storage"
	"sigma/main/core/types"
)

func UploadFile(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	var input = (dto).(dtos_storage.UploadDto)
	if !((len(input.Data) == 1) && (len(input.DataKey) == 1)) {
		return outputs_storage.Binary{}, errors.New("we need 1 file and 1 file key")
	}
	if err := assistant.SaveFileToStorage(app.StorageRoot, input.Data[0], input.DataKey[0]); err != nil {
		fmt.Println(err)
		return outputs_storage.Binary{}, err
	}

	return outputs_storage.Binary{}, nil
}

func DownloadFile(app *types.App, dto interface{}, assistant types.Assistant) (any, error) {
	input := (dto).(*dtos_storage.DownloadDto)
	var path = fmt.Sprintf("%s/%d/%s", app.StorageRoot, assistant.RoomId, input.FileKey)
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return outputs_storage.Binary{}, err
	} else {
		return outputs.Command{Value: "sendFile", Data: path}, nil
	}
}

func CreateStorageService(app *types.App) *types.Service {
	s := types.CreateService(app, "storage")
	s.AddMethod(types.CreateMethod("upload", UploadFile, types.CreateCheck(true, true, true), dtos_storage.UploadDto{}, types.CreateMethodOptions(true, false)))
	s.AddMethod(types.CreateMethod("download", DownloadFile, types.CreateCheck(true, true, true), dtos_storage.DownloadDto{}, types.CreateMethodOptions(true, false)))
	return s
}
