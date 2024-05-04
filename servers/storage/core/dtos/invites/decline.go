package dtos_invites

type DeclineDto struct {
	InviteId  int64  `json:"inviteId" validate:"required"`
}

func (d DeclineDto) GetData() any {
	return "dummy"
}
