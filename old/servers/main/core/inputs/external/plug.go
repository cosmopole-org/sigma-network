package inputs_external

import (
	"mime/multipart"
)

type PlugInput struct {
	Key  string                `json:"key" validate:"required"`
	Meta string                `json:"meta" validate:"required"`
	File *multipart.FileHeader `json:"file" validate:"required"`
}

func (d PlugInput) GetData() any {
	return "dummy"
}

func (d PlugInput) GetSpaceId() string {
	return ""
}

func (d PlugInput) GetTopicId() string {
	return ""
}

func (d PlugInput) GetMemberId() string {
	return ""
}
