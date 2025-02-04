package inputs_spaces

type ReadMemberInput struct {
	SpaceId  string `json:"spaceId" validate:"required"`
}

func (d ReadMemberInput) GetData() any {
	return "dummy"
}

func (d ReadMemberInput) GetSpaceId() string {
	return d.SpaceId
}

func (d ReadMemberInput) GetTopicId() string {
	return ""
}

func (d ReadMemberInput) GetMemberId() string {
	return ""
}
