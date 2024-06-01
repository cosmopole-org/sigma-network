package services

import (
	"errors"
	"fmt"
	"log"
	"os"
	"sigma/storage/core/models"
	outputs "sigma/storage/core/outputs"
	"sigma/storage/core/runtime"
	"sigma/storage/shell/tools"
	dtos_storage "sigma/storage/storage/dtos/storage"
	outputs_storage "sigma/storage/storage/outputs/storage"

	"github.com/gofiber/fiber/v2"
)

type StorageService struct {
	toolbox *tools.Toolbox
}

func (ss *StorageService) UploadFile(control *runtime.Control, input dtos_storage.UploadDto, info models.Info) (any, error) {
	if !((len(input.Data) == 1) && (len(input.DataKey) == 1)) {
		return outputs_storage.Binary{}, errors.New("we need 1 file and 1 file key")
	}
	if err := ss.toolbox.File().SaveFileToStorage(control.StorageRoot, input.Data[0], info.Member.TopicIds, input.DataKey[0]); err != nil {
		log.Println(err)
		return outputs_storage.Binary{}, err
	}
	return outputs_storage.Binary{}, nil
}

func (ss *StorageService) DownloadFile(control *runtime.Control, input dtos_storage.DownloadDto, info models.Info) (any, error) {
	var path = fmt.Sprintf("%s/%s/%s", control.StorageRoot, info.Member.TopicIds, input.FileKey)
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return outputs_storage.Binary{}, err
	} else {
		return outputs.Command{Value: "sendFile", Data: path}, nil
	}
}

func CreateStorageService(toolbox *tools.Toolbox) {

	storageS := &StorageService{
		toolbox: toolbox,
	}

	// Methods
	uploadAction := runtime.CreateAction(
		toolbox.App,
		"/storages/upload",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(true, true, false, false, fiber.MethodPost),
		true,
		storageS.UploadFile,
	)
	toolbox.Services().AddAction(uploadAction)
	toolbox.Net().SwitchNetAccessByAction(uploadAction, func(i interface{}) (any, error) { return nil, nil })

	downloadAction := runtime.CreateAction(
		toolbox.App,
		"/storages/download",
		runtime.CreateCk(true, true, true),
		runtime.CreateAc(true, true, false, false, fiber.MethodGet),
		true,
		storageS.DownloadFile,
	)
	toolbox.Services().AddAction(downloadAction)
	toolbox.Net().SwitchNetAccessByAction(downloadAction, func(i interface{}) (any, error) { return nil, nil })
}
