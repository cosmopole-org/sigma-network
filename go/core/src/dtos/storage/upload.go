package dtos_storage

import "mime/multipart"

type UploadDto struct {
	Data    []*multipart.FileHeader `json:"data" validate:"required"`
	DataKey []string                `json:"dataKey" validate:"required"`
}

func (d UploadDto) GetData() any {
	return "dummy"
}
