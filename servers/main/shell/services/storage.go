package services

import (
	"errors"
	"fmt"
	"os"
	dtos_storage "sigma/main/shell/dtos/storage"
	"sigma/main/core/modules"
	"sigma/main/core/outputs"
	outputs_storage "sigma/main/core/outputs/storage"

	"github.com/gofiber/fiber/v2"
)

func UploadFile(app *modules.App, input dtos_storage.UploadDto, assistant modules.Assistant) (any, error) {
	if !((len(input.Data) == 1) && (len(input.DataKey) == 1)) {
		return outputs_storage.Binary{}, errors.New("we need 1 file and 1 file key")
	}
	if err := assistant.SaveFileToStorage(app.StorageRoot, input.Data[0], input.DataKey[0]); err != nil {
		fmt.Println(err)
		return outputs_storage.Binary{}, err
	}
	return outputs_storage.Binary{}, nil
}

func DownloadFile(app *modules.App, input dtos_storage.DownloadDto, assistant modules.Assistant) (any, error) {
	var path = fmt.Sprintf("%s/%d/%s", app.StorageRoot, assistant.RoomId, input.FileKey)
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return outputs_storage.Binary{}, err
	} else {
		return outputs.Command{Value: "sendFile", Data: path}, nil
	}
}

func CreateStorageService(app *modules.App) {

	// Methods
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_storage.UploadDto, dtos_storage.UploadDto](
			"/storages/upload",
			UploadFile,
			dtos_storage.UploadDto{},
			modules.CreateCheck(true, true, true),
			modules.CreateMethodOptions(true, fiber.MethodPost, true, false),
			modules.CreateInterFedOptions(true, true),
		),
	)
	modules.AddMethod(
		app,
		modules.CreateMethod[dtos_storage.DownloadDto, dtos_storage.DownloadDto](
			"/storages/download",
			DownloadFile,
			dtos_storage.DownloadDto{},
			modules.CreateCheck(true, true, true),
			modules.CreateMethodOptions(true, fiber.MethodGet, true, false),
			modules.CreateInterFedOptions(true, true),
		),
	)
}