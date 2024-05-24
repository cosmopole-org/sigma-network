package services

import (
	"errors"
	"fmt"
	"log"
	"os"
	"sigma/storage/core/models"
	outputs "sigma/storage/core/outputs"
	"sigma/storage/core/runtime"
	"sigma/storage/shell/managers"
	dtos_storage "sigma/storage/storage/dtos/storage"
	outputs_storage "sigma/storage/storage/outputs/storage"

	"github.com/gofiber/fiber/v2"
)

type StorageService struct {
	managers *managers.Managers
}

func (ss *StorageService) UploadFile(app *runtime.App, input dtos_storage.UploadDto, assistant models.Assistant) (any, error) {
	if !((len(input.Data) == 1) && (len(input.DataKey) == 1)) {
		return outputs_storage.Binary{}, errors.New("we need 1 file and 1 file key")
	}
	if err := ss.managers.StorageManager().SaveFileToStorage(app.StorageRoot, input.Data[0], assistant.RoomId, input.DataKey[0]); err != nil {
		log.Println(err)
		return outputs_storage.Binary{}, err
	}
	return outputs_storage.Binary{}, nil
}

func (ss *StorageService) DownloadFile(app *runtime.App, input dtos_storage.DownloadDto, assistant models.Assistant) (any, error) {
	var path = fmt.Sprintf("%s/%d/%s", app.StorageRoot, assistant.RoomId, input.FileKey)
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return outputs_storage.Binary{}, err
	} else {
		return outputs.Command{Value: "sendFile", Data: path}, nil
	}
}

func CreateStorageService(sc *runtime.App, mans *managers.Managers) {

	storageS := &StorageService{
		managers: mans,
	}

	// Methods
	uploadAction := runtime.CreateAction(
		sc,
		"/storages/upload",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(true, true, false, false, fiber.MethodPost),
		true,
		storageS.UploadFile,
	)
	sc.Services.AddAction(uploadAction)
	storageS.managers.NetManager().SwitchNetAccessByAction(uploadAction, func(i interface{}) (any, error) { return nil, nil })

	downloadAction := runtime.CreateAction(
		sc,
		"/storages/download",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(true, true, false, false, fiber.MethodGet),
		true,
		storageS.DownloadFile,
	)
	sc.Services.AddAction(downloadAction)
	storageS.managers.NetManager().SwitchNetAccessByAction(downloadAction, func(i interface{}) (any, error) { return nil, nil })
}
