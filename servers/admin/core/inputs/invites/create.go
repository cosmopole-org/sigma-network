package inputs_invites

type CreateInput struct {
	UserId  string `json:"humanId" validate:"required"`
	SpaceId string `json:"spaceId" validate:"required"`
}

func (d CreateInput) GetData() any {
	return "dummy"
}

func (d CreateInput) GetSpaceId() string {
	return d.SpaceId
}

func (d CreateInput) GetTopicId() string {
	return ""
}

func (d CreateInput) GetMemberId() string {
	return ""
}
