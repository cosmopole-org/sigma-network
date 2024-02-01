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

func UploadFile(app *interfaces.IApp, dto interfaces.IDto, assistant interfaces.IAssistant) (any, error) {
	packet := assistant.GetWebPacket().(types.WebPacket)
	fh, err := packet.GetFormFile("data")
	if err != nil {
		fmt.Println(err)
		return outputs_storage.Binary{}, err
	}
	if err := assistant.SaveFileToStorage((*app).GetStorageRoot(), fh, string(packet.GetHeader("data_key"))); err != nil {
		fmt.Println(err)
		return outputs_storage.Binary{}, err
	}
	return outputs_storage.Binary{}, nil
}

func DownloadFile(app *interfaces.IApp, dto interfaces.IDto, assistant interfaces.IAssistant) (any, error) {
	input := dto.(*dtos_storage.DownloadDto)
	var path = fmt.Sprintf("%s/%d/%s", (*app).GetStorageRoot(), assistant.GetRoomId(), input.FileKey)
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return outputs_storage.Binary{}, err	
	} else {
		return outputs.Command{Value: "sendFile", Data: path}, nil
	}
}

func CreateStorageService(app *interfaces.IApp) interfaces.IService {
	return types.CreateService("storage").
		AddMethod(types.CreateMethod("upload", UploadFile, types.CreateCheck(true, true, true), nil, true, true)).
		AddMethod(types.CreateMethod("download", DownloadFile, types.CreateCheck(true, true, true), &dtos_storage.DownloadDto{}, true, false))
}
