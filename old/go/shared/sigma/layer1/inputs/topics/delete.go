package inputs_topics

type DeleteInput struct {
	TopicId string `json:"topicId" validate:"required"`
	SpaceId string `json:"spaceId" validate:"required"`
}

func (d DeleteInput) GetData() any {
	return "dummy"
}

func (d DeleteInput) GetSpaceId() string {
	return d.SpaceId
}

func (d DeleteInput) GetTopicId() string {
	return d.TopicId
}

func (d DeleteInput) GetMemberId() string {
	return ""
}
