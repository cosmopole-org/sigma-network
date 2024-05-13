package dtos_external

import (
	"mime/multipart"
	"sigma/admin/core/modules"
)

type PlugDto struct {
	Key  string                   `json:"key" validate:"required"`
	Meta []modules.PluginFunction `json:"meta" validate:"required"`
	File *multipart.FileHeader    `json:"file" validate:"required"`
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
