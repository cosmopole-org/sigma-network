package inputs_invites

type CancelInput struct {
	InviteId string `json:"inviteId" validate:"required"`
	SpaceId  string `json:"spaceId" validate:"required"`
}

func (d CancelInput) GetData() any {
	return "dummy"
}

func (d CancelInput) GetSpaceId() string {
	return d.SpaceId
}

func (d CancelInput) GetTopicId() string {
	return ""
}

func (d CancelInput) GetMemberId() string {
	return ""
}
