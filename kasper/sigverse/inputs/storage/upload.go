package inputs_storage

import "mime/multipart"

type UploadInput struct {
	Data    []*multipart.FileHeader `json:"data" validate:"required,max=1,min=1"`
	SpaceId string                  `json:"spaceId" validate:"required"`
	TopicId string                  `json:"topicId" validate:"required"`
	FileId  string                  `json:"fileId"`
}

func (d UploadInput) GetData() any {
	return "dummy"
}

func (d UploadInput) GetSpaceId() string {
	return d.SpaceId
}

func (d UploadInput) GetTopicId() string {
	return d.TopicId
}

func (d UploadInput) GetMemberId() string {
	return ""
}
