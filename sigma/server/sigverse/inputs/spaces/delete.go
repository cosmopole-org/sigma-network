package inputs_spaces

type DeleteInput struct {
	SpaceId string `json:"spaceId" validate:"required"`
}

func (d DeleteInput) GetData() any {
	return "dummy"
}

func (d DeleteInput) GetSpaceId() string {
	return d.SpaceId
}

func (d DeleteInput) GetTopicId() string {
	return ""
}

func (d DeleteInput) GetMemberId() string {
	return ""
}
