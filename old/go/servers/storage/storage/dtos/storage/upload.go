package dtos_storage

import (
	"mime/multipart"
)

type UploadDto struct {
	Data    []*multipart.FileHeader `json:"data" validate:"required,max=1,min=1"`
	DataKey []string                `json:"dataKey" validate:"required,max=1,min=1"`
	SpaceId []string                `json:"spaceId" validate:"required"`
	TopicId []string               `json:"topicId" validate:"required"`
}

func (d UploadDto) GetData() any {
	return "dummy"
}

func (d UploadDto) GetSpaceId() string {
	return d.SpaceId[0]
}

func (d UploadDto) GetTopicId() string {
	return d.TopicId[0]
}

func (d UploadDto) GetMemberId() string {
	return ""
}
