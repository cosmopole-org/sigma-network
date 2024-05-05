package dtos_storage

import (
	"mime/multipart"
	"strconv"
)

type UploadDto struct {
	Data    []*multipart.FileHeader `json:"data" validate:"required,max=1,min=1"`
	DataKey []string                `json:"dataKey" validate:"required,max=1,min=1"`
	TowerId []string                   `json:"towerId" validate:"required"`
	RoomId  []string                   `json:"roomId" validate:"required"`
}

func (d UploadDto) GetData() any {
	return "dummy"
}

func (d UploadDto) GetTowerId() int64 {
	if len(d.RoomId) == 0 {
		return 0
	}
	tid, err := strconv.ParseInt(d.TowerId[0], 10, 64)
	if (err == nil) {
		return tid
	}
	return tid
}

func (d UploadDto) GetRoomId() int64 {
	if len(d.RoomId) == 0 {
		return 0
	}
	rid, err := strconv.ParseInt(d.RoomId[0], 10, 64)
	if (err == nil) {
		return rid
	}
	return rid
}
