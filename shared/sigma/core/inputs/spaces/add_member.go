package inputs_spaces

type AddMemberInput struct {
	UserId   string `json:"userId" validate:"required"`
	SpaceId  string `json:"spaceId" validate:"required"`
	Metadata string `json:"metadata" validate:"required"`
}

func (d AddMemberInput) GetData() any {
	return "dummy"
}

func (d AddMemberInput) GetSpaceId() string {
	return d.SpaceId
}

func (d AddMemberInput) GetTopicId() string {
	return ""
}

func (d AddMemberInput) GetMemberId() string {
	return ""
}
