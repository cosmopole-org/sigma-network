package inputs_invites

type DeclineInput struct {
	InviteId int64 `json:"inviteId" validate:"required"`
}

func (d DeclineInput) GetData() any {
	return "dummy"
}

func (d DeclineInput) GetSpaceId() string {
	return ""
}

func (d DeclineInput) GetTopicId() string {
	return ""
}

func (d DeclineInput) GetMemberId() string {
	return ""
}
