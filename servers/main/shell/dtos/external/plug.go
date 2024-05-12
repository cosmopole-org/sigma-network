package dtos_external

import "mime/multipart"

type PlugDto struct {
	Key     string                `json:"key" validate:"required"`
	ApiList string                `json:"apiList" validate:"required"`
	File    *multipart.FileHeader `json:"file" validate:"required"`
}

func (d PlugDto) GetData() any {
	return "dummy"
}

func (d PlugDto) GetTowerId() int64 {
	return 0
}

func (d PlugDto) GetRoomId() int64 {
	return 0
}

func (d PlugDto) GetWorkerId() int64 {
	return 0
}
