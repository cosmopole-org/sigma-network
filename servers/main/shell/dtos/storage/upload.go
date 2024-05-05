package dtos_storage

import "mime/multipart"

type UploadDto struct {
	Data    []*multipart.FileHeader `json:"data" validate:"required,max=1,min=1"`
	DataKey []string                `json:"dataKey" validate:"required,max=1,min=1"`
	TowerId int64                   `json:"towerId" validate:"required"`
	RoomId  int64                   `json:"roomId" validate:"required"`
}

func (d UploadDto) GetData() any {
	return "dummy"
}

func (d UploadDto) GetTowerId() int64 {
	return d.TowerId
}

func (d UploadDto) GetRoomId() int64 {
	return d.RoomId
}
