package dtos_invites

type AcceptDto struct {
	InviteId int64 `json:"inviteId" validate:"required"`
}

func (d AcceptDto) GetData() any {
	return "dummy"
}
