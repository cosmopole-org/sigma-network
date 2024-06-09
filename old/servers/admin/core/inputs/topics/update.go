package inputs_topics

type UpdateInput struct {
	SpaceId string `json:"spaceId" validate:"required"`
	TopicId string `json:"topicId" validate:"required"`
	Title   string `json:"title" validate:"required"`
	Avatar  string `json:"avatar" validate:"required"`
}

func (d UpdateInput) GetData() any {
	return "dummy"
}

func (d UpdateInput) GetSpaceId() string {
	return d.SpaceId
}

func (d UpdateInput) GetTopicId() string {
	return d.TopicId
}

func (d UpdateInput) GetMemberId() string {
	return ""
}
