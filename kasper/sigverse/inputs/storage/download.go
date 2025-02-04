package inputs_storage

type DownloadInput struct {
	FileId  string `json:"fileId" validate:"required"`
	SpaceId string `json:"spaceId" validate:"required"`
	TopicId string `json:"topicId" validate:"required"`
}

func (d DownloadInput) GetData() any {
	return "dummy"
}

func (d DownloadInput) GetSpaceId() string {
	return d.SpaceId
}

func (d DownloadInput) GetTopicId() string {
	return d.TopicId
}

func (d DownloadInput) GetMemberId() string {
	return ""
}
