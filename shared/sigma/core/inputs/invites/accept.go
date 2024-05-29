package inputs_invites

type AcceptInput struct {
	InviteId int64 `json:"inviteId" validate:"required"`
}

func (d AcceptInput) GetData() any {
	return "dummy"
}

func (d AcceptInput) GetSpaceId() string {
	return ""
}

func (d AcceptInput) GetTopicId() string {
	return ""
}

func (d AcceptInput) GetMemberId() string {
	return ""
}
