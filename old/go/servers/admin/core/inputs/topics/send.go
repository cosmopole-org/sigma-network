package inputs_topics

type SendInput struct {
	Data     string `json:"data" validate:"required"`
	RecvId   string `json:"recvId"`
	MemberId string `json:"memberId"`
	SpaceId  string `json:"spaceId" validate:"required"`
	TopicId  string `json:"topicId" validate:"required"`
	Type     string `json:"type" validate:"required"`
}

func (d SendInput) GetData() any {
	return "dummy"
}

func (d SendInput) GetSpaceId() string {
	return d.SpaceId
}

func (d SendInput) GetTopicId() string {
	return d.TopicId
}

func (d SendInput) GetMemberId() string {
	return d.MemberId
}
