package dtos_storage

import "mime/multipart"

type UploadDto struct {
	Data    []*multipart.FileHeader `json:"data" validate:"required,max=1,min=1"`
	DataKey []string                `json:"dataKey" validate:"required,max=1,min=1"`
}

func (d UploadDto) GetData() any {
	return "dummy"
}
