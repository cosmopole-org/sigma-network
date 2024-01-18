package dtos_invites

type CancelDto struct {
	InviteId  int64  `json:"inviteId" validate:"required"`
}

func (d CancelDto) GetData() any {
	return "dummy"
}
