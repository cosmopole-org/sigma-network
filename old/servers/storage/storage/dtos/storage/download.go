package dtos_storage

type DownloadDto struct {
	FileKey string `json:"fileKey" validate:"required"`
	SpaceId string `json:"spaceId" validate:"required"`
	TopicId string `json:"topicId" validate:"required"`
}

func (d DownloadDto) GetData() any {
	return "dummy"
}

func (d DownloadDto) GetSpaceId() string {
	return d.SpaceId
}

func (d DownloadDto) GetTopicId() string {
	return d.TopicId
}

func (d DownloadDto) GetMemberId() string {
	return ""
}
