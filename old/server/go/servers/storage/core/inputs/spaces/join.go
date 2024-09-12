package inputs_spaces

type JoinInput struct {
	SpaceId string `json:"spaceId" validate:"required"`
}

func (d JoinInput) GetData() any {
	return "dummy"
}

func (d JoinInput) GetSpaceId() string {
	return d.SpaceId
}

func (d JoinInput) GetTopicId() string {
	return ""
}

func (d JoinInput) GetMemberId() string {
	return ""
}
