package inputs_topics

type ReadInput struct{
	SpaceId string `json:"spaceId" validate:"required"`
}

func (d ReadInput) GetData() any {
	return "dummy"
}

func (d ReadInput) GetSpaceId() string {
	return ""
}

func (d ReadInput) GetTopicId() string {
	return ""
}

func (d ReadInput) GetMemberId() string {
	return ""
}
