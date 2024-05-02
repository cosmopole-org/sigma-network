package services

import (
	"errors"
	"fmt"
	"os"
	dtos_storage "sigma/main/core/dtos/storage"
	"sigma/main/core/modules"
	"sigma/main/core/outputs"
	outputs_storage "sigma/main/core/outputs/storage"
)

func UploadFile(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
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

func DownloadFile(app *modules.App, dto interface{}, assistant modules.Assistant) (any, error) {
	input := (dto).(*dtos_storage.DownloadDto)
	var path = fmt.Sprintf("%s/%d/%s", app.StorageRoot, assistant.RoomId, input.FileKey)
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return outputs_storage.Binary{}, err
	} else {
		return outputs.Command{Value: "sendFile", Data: path}, nil
	}
}

func CreateStorageService(app *modules.App) {
	// s := modules.CreateService(app, "storage")
	// // s.AddMethod(modules.CreateMethod("upload", UploadFile, modules.CreateCheck(true, true, true), dtos_storage.UploadDto{}, modules.CreateMethodOptions(true, true, false)))
	// // s.AddMethod(modules.CreateMethod("download", DownloadFile, modules.CreateCheck(true, true, true), dtos_storage.DownloadDto{}, modules.CreateMethodOptions(true, true, false)))
	// return s
}
